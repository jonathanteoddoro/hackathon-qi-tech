import { Injectable } from '@nestjs/common';
import { Proposal, Investment, SojaPrice } from '../entities/proposal.entity';
import { RiskService } from './risk.service';
import { RepaymentService } from './repayment.service';
import { DatabaseService } from './database.service';
import axios from 'axios';

@Injectable()
export class ProposalService {
  private currentSojaPrice = 180; // BRL por saca (mock)

  constructor(
    private readonly riskService: RiskService,
    private readonly repaymentService: RepaymentService,
    private readonly databaseService: DatabaseService,
  ) {}

  // Mock de preço da soja
  async getSojaPrice(): Promise<SojaPrice> {
    // Simula variação de preço
    const variation = (Math.random() - 0.5) * 10; // +/- 5 BRL
    this.currentSojaPrice = Math.max(150, this.currentSojaPrice + variation);
    
    return {
      price: this.currentSojaPrice,
      timestamp: new Date(),
      source: 'CBOT_MOCK'
    };
  }

  // Calcula LTV baseado no preço atual da soja
  private calculateLTV(requestedAmount: number, sojaQuantity: number): number {
    const collateralValue = sojaQuantity * this.currentSojaPrice;
    return (requestedAmount / collateralValue) * 100;
  }

  // Calcula score de risco baseado no LTV
  private calculateRiskScore(ltv: number): 'A' | 'B' | 'C' {
    if (ltv <= 50) return 'A';
    if (ltv <= 70) return 'B';
    return 'C';
  }

  // Criar nova proposta
  async createProposal(data: {
    producerName: string;
    producerLocation: string;
    requestedAmount: number;
    term: number;
    maxInterestRate: number;
    sojaQuantity: number;
  }): Promise<Proposal> {
    const ltv = this.calculateLTV(data.requestedAmount, data.sojaQuantity);
    const riskScore = this.calculateRiskScore(ltv);

    const proposalId = `prop_${Date.now()}`;

    // Buscar ou criar usuário produtor
    await this.databaseService.findOrCreateUser(data.producerName, 'PRODUCER', data.producerLocation);

    // Criar proposta no banco
    await this.databaseService.createProposal({
      id: proposalId,
      producerName: data.producerName,
      producerLocation: data.producerLocation,
      requestedAmount: data.requestedAmount,
      term: data.term,
      maxInterestRate: data.maxInterestRate,
      sojaQuantity: data.sojaQuantity,
      sojaPrice: this.currentSojaPrice,
      ltv,
      riskScore,
      status: 'PENDING',
      fundedAmount: 0
    });

    // Retornar proposta completa
    const proposal = await this.databaseService.getProposalWithInvestments(proposalId);
    if (!proposal) throw new Error('Erro ao criar proposta');
    return proposal;
  }

  // Listar propostas disponíveis para investimento
  async getAvailableProposals(): Promise<Proposal[]> {
    return await this.databaseService.getAllProposalsWithInvestments()
      .then(proposals => proposals.filter(p => p.status === 'PENDING'));
  }

  // Investir em uma proposta
  async investInProposal(proposalId: string, investment: {
    investorName: string;
    amount: number;
  }): Promise<Investment> {
    const proposal = await this.databaseService.getProposalWithInvestments(proposalId);
    if (!proposal) throw new Error('Proposta não encontrada');
    
    if (proposal.status !== 'PENDING') {
      throw new Error('Proposta não está disponível para investimento');
    }

    // Calcular retorno esperado baseado no risco
    const baseRate = 12; // taxa base 12% ao ano
    const riskPremium = proposal.riskScore === 'A' ? 0 : proposal.riskScore === 'B' ? 3 : 6;
    const expectedReturn = baseRate + riskPremium;

    const investmentId = `inv_${Date.now()}`;

    // Buscar ou criar usuário investidor
    await this.databaseService.findOrCreateUser(investment.investorName, 'INVESTOR');

    // Criar investimento no banco
    await this.databaseService.createInvestment({
      id: investmentId,
      proposalId,
      investorName: investment.investorName,
      amount: investment.amount,
      expectedReturn
    });

    // Atualizar funded amount da proposta
    const newFundedAmount = proposal.fundedAmount + investment.amount;
    await this.databaseService.updateProposal(proposalId, { 
      fundedAmount: newFundedAmount,
      status: newFundedAmount >= proposal.requestedAmount ? 'FUNDED' : 'PENDING'
    });

    const newInvestment: Investment = {
      id: investmentId,
      proposalId,
      investorName: investment.investorName,
      amount: investment.amount,
      expectedReturn,
      investedAt: new Date()
    };

    // Se totalmente financiado, cria cronograma de repagamento
    if (newFundedAmount >= proposal.requestedAmount) {
      const schedule = this.repaymentService.calculateRepaymentSchedule(
        { ...proposal, fundedAmount: newFundedAmount }, 
        expectedReturn
      );
      console.log(`📅 Cronograma criado para proposta ${proposalId}`);
    }

    return newInvestment;
  }

  // Listar investimentos de um investidor
  async getInvestmentsByInvestor(investorName: string): Promise<Investment[]> {
    const investments = await this.databaseService.findInvestmentsByInvestor(investorName);
    return investments.map(inv => ({
      id: inv.id,
      proposalId: inv.proposalId,
      investorName: inv.investorName,
      amount: +inv.amount,
      expectedReturn: +inv.expectedReturn,
      investedAt: inv.investedAt
    }));
  }

  // Listar propostas de um produtor
  async getProposalsByProducer(producerName: string): Promise<Proposal[]> {
    return await this.databaseService.getAllProposalsWithInvestments()
      .then(proposals => proposals.filter(p => p.producerName === producerName));
  }

  // Atualizar preços e recalcular LTVs
  async updatePricesAndLTVs(): Promise<void> {
    const newPrice = await this.getSojaPrice();
    
    const proposals = await this.databaseService.getAllProposalsWithInvestments();
    
    for (const proposal of proposals) {
      if (proposal.status === 'ACTIVE' || proposal.status === 'FUNDED') {
        const newLTV = this.calculateLTV(proposal.requestedAmount, proposal.sojaQuantity);
        
        await this.databaseService.updateProposal(proposal.id, {
          ltv: newLTV,
          sojaPrice: newPrice.price
        });
        
        // Se LTV muito alto, status de alerta
        if (newLTV > 90) {
          console.log(`⚠️  ALERTA: Proposta ${proposal.id} com LTV alto: ${newLTV}%`);
        }
      }
    }
  }

  // Get proposal by ID
  async getProposalById(id: string): Promise<Proposal | null> {
    return await this.databaseService.getProposalWithInvestments(id);
  }

  // Dashboard do investidor com métricas de risco
  async getInvestorDashboard(investorName: string): Promise<{
    investments: Investment[];
    totalInvested: number;
    expectedReturns: number;
    riskMetrics: any;
    alerts: any[];
  }> {
    const investments = await this.getInvestmentsByInvestor(investorName);
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const expectedReturns = investments.reduce((sum, inv) => {
      const annualReturn = (inv.amount * inv.expectedReturn) / 100;
      return sum + annualReturn;
    }, 0);

    // Métricas de risco do portfolio do investidor
    const proposalIds = investments.map(inv => inv.proposalId);
    const allProposals = await this.databaseService.getAllProposalsWithInvestments();
    const investorProposals = allProposals.filter(p => proposalIds.includes(p.id));

    const riskMetrics = this.riskService.getPortfolioRiskStats(investorProposals);
    const alerts = this.riskService.getActiveAlerts()
      .filter(alert => investorProposals.some(p => p.id === alert.proposalId));

    return {
      investments,
      totalInvested,
      expectedReturns,
      riskMetrics,
      alerts
    };
  }

  // Dashboard do produtor
  async getProducerDashboard(producerName: string): Promise<{
    proposals: Proposal[];
    totalRequested: number;
    totalFunded: number;
    activeLoans: number;
    volumeTotal: number;
    apyMedio: number;
    taxaSucesso: number;
    totalFinanciado: number;
    repaymentSchedules: any[];
    upcomingPayments: any[];
  }> {
    const proposals = await this.getProposalsByProducer(producerName);
    const totalRequested = proposals.reduce((sum, p) => sum + p.requestedAmount, 0);
    const totalFunded = proposals.reduce((sum, p) => sum + p.fundedAmount, 0);
    const activeLoans = proposals.filter(p => p.status === 'FUNDED' || p.status === 'ACTIVE').length;

    // Calcular métricas adicionais
    const fundedProposals = proposals.filter(p => p.status === 'FUNDED' || p.status === 'ACTIVE' || p.status === 'REPAID');
    const volumeTotal = fundedProposals.reduce((sum, p) => sum + p.fundedAmount, 0);
    
    // APY Médio baseado nas taxas de interesse
    const apyMedio = fundedProposals.length > 0
      ? fundedProposals.reduce((sum, p) => {
          // Calcula APY baseado no risco: A=12%, B=15%, C=18%
          const baseRate = p.riskScore === 'A' ? 12 : p.riskScore === 'B' ? 15 : 18;
          return sum + baseRate;
        }, 0) / fundedProposals.length
      : 0;
    
    // Taxa de Sucesso = (propostas pagas + ativas) / total de propostas financiadas
    const successfulLoans = proposals.filter(p => 
      p.status === 'REPAID' || p.status === 'ACTIVE' || p.status === 'FUNDED'
    ).length;
    const taxaSucesso = proposals.length > 0 
      ? (successfulLoans / proposals.length) * 100 
      : 0;
    
    const totalFinanciado = totalFunded;

    const repaymentSchedules = proposals
      .filter(p => p.status === 'FUNDED' || p.status === 'ACTIVE')
      .map(p => this.repaymentService.getRepaymentSchedule(p.id))
      .filter(Boolean);

    const upcomingPayments = this.repaymentService.getUpcomingDueDates(30)
      .filter(payment => proposals.some(p => p.id === payment.proposalId));

    return {
      proposals,
      totalRequested,
      totalFunded,
      activeLoans,
      volumeTotal,
      apyMedio,
      taxaSucesso,
      totalFinanciado,
      repaymentSchedules,
      upcomingPayments
    };
  }

  // Simulação de liquidação (para testes)
  async simulateLiquidation(proposalId: string): Promise<{
    success: boolean;
    liquidationValue: number;
    recoveredAmount: number;
    loss: number;
  }> {
    const proposal = await this.databaseService.getProposalWithInvestments(proposalId);
    if (!proposal) {
      throw new Error('Proposta não encontrada');
    }

    // Simula venda da garantia com desconto de liquidação (10%)
    const liquidationDiscount = 0.10;
    const currentCollateralValue = proposal.sojaQuantity * this.currentSojaPrice;
    const liquidationValue = currentCollateralValue * (1 - liquidationDiscount);
    const outstandingDebt = proposal.fundedAmount; // Simplificado

    const recoveredAmount = Math.min(liquidationValue, outstandingDebt);
    const loss = Math.max(0, outstandingDebt - recoveredAmount);

    // Atualiza status
    await this.databaseService.updateProposal(proposalId, { status: 'LIQUIDATED' });

    console.log(`🚨 LIQUIDAÇÃO: Proposta ${proposalId} liquidada. Recuperado: R$ ${recoveredAmount}, Perda: R$ ${loss}`);

    return {
      success: true,
      liquidationValue,
      recoveredAmount,
      loss
    };
  }
}