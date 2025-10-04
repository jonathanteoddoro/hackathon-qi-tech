import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProposalService } from '../services/proposal.service';
import { RiskService } from '../services/risk.service';
import { RepaymentService } from '../services/repayment.service';

@Controller('api')
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly riskService: RiskService,
    private readonly repaymentService: RepaymentService,
  ) {}

  // 🌱 APIS DO PRODUTOR
  
  @Post('proposals')
  async createProposal(@Body() createProposalDto: {
    producerName: string;
    producerLocation: string;
    requestedAmount: number;
    term: number;
    maxInterestRate: number;
    sojaQuantity: number;
  }) {
    return await this.proposalService.createProposal(createProposalDto);
  }

  @Get('proposals/producer/:producerName')
  async getProducerProposals(@Param('producerName') producerName: string) {
    return await this.proposalService.getProposalsByProducer(producerName);
  }

  // 💰 APIS DO INVESTIDOR

  @Get('opportunities')
  async getInvestmentOpportunities() {
    return await this.proposalService.getAvailableProposals();
  }

  @Get('opportunities/:id')
  async getOpportunityDetails(@Param('id') id: string) {
    return await this.proposalService.getProposalById(id);
  }

  @Post('investments')
  async investInProposal(@Body() investmentDto: {
    proposalId: string;
    investorName: string;
    amount: number;
  }) {
    return await this.proposalService.investInProposal(
      investmentDto.proposalId,
      {
        investorName: investmentDto.investorName,
        amount: investmentDto.amount
      }
    );
  }

  @Get('investments/investor/:investorName')
  async getInvestorPortfolio(@Param('investorName') investorName: string) {
    return await this.proposalService.getInvestmentsByInvestor(investorName);
  }

  // 📊 APIS DE DADOS

  @Get('soja-price')
  async getSojaPrice() {
    return await this.proposalService.getSojaPrice();
  }

  @Post('update-prices')
  async updatePrices() {
    await this.proposalService.updatePricesAndLTVs();
    return { message: 'Preços atualizados com sucesso' };
  }

  // 📊 APIS DE DASHBOARDS

  @Get('dashboard/investor/:investorName')
  async getInvestorDashboard(@Param('investorName') investorName: string) {
    return await this.proposalService.getInvestorDashboard(investorName);
  }

  @Get('dashboard/producer/:producerName')
  async getProducerDashboard(@Param('producerName') producerName: string) {
    return await this.proposalService.getProducerDashboard(producerName);
  }

  // 🚨 APIS DE RISCO E MONITORAMENTO

  @Get('risk/alerts')
  async getRiskAlerts() {
    return this.riskService.getActiveAlerts();
  }

  @Get('risk/proposal/:proposalId')
  async getProposalRisk(@Param('proposalId') proposalId: string) {
    const proposal = await this.proposalService.getProposalById(proposalId);
    if (!proposal) {
      return { error: 'Proposta não encontrada' };
    }
    return this.riskService.assessProposalRisk(proposal);
  }

  @Post('risk/monitor')
  async monitorRisks() {
    const proposals = await this.proposalService.getAvailableProposals();
    const alerts = this.riskService.monitorActiveProposals(proposals);
    return { message: `Monitoramento executado. ${alerts.length} novos alertas criados.`, alerts };
  }

  // 💰 APIS DE REPAGAMENTO

  @Get('repayment/schedule/:proposalId')
  async getRepaymentSchedule(@Param('proposalId') proposalId: string) {
    return this.repaymentService.getRepaymentSchedule(proposalId);
  }

  @Post('repayment/pay')
  async processPayment(@Body() paymentDto: {
    proposalId: string;
    amount: number;
    method: 'PIX' | 'BANK_TRANSFER' | 'CRYPTO';
  }) {
    return this.repaymentService.processPayment(
      paymentDto.proposalId,
      paymentDto.amount,
      paymentDto.method
    );
  }

  @Get('repayment/upcoming')
  async getUpcomingPayments(@Query('days') days?: string) {
    const daysAhead = days ? parseInt(days) : 30;
    return this.repaymentService.getUpcomingDueDates(daysAhead);
  }

  @Get('repayment/overdue')
  async getOverduePayments() {
    return this.repaymentService.getOverdueInstallments();
  }

  @Get('repayment/history/:proposalId')
  async getPaymentHistory(@Param('proposalId') proposalId: string) {
    return this.repaymentService.getPaymentHistory(proposalId);
  }

  @Get('repayment/default-report')
  async getDefaultReport() {
    return this.repaymentService.getDefaultReport();
  }

  // ⚡ APIS DE SIMULAÇÃO

  @Post('simulate/liquidation/:proposalId')
  async simulateLiquidation(@Param('proposalId') proposalId: string) {
    return await this.proposalService.simulateLiquidation(proposalId);
  }
}