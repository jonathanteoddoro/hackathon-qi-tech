import { Controller, Get, Post, Body, Param, Query, Headers, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProposalService } from '../services/proposal.service';
import { RiskService } from '../services/risk.service';
import { RepaymentService } from '../services/repayment.service';
import { MarketplaceService } from '../services/marketplace.service';
import { DocumentValidationService } from '../services/document-validation.service';

@Controller('api')
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly riskService: RiskService,
    private readonly repaymentService: RepaymentService,
    private readonly marketplaceService: MarketplaceService,
    private readonly documentValidationService: DocumentValidationService,
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

  @Get('dashboard/producer/:producerIdentifier')
  async getProducerDashboard(
    @Param('producerIdentifier') producerIdentifier: string,
    @Headers('authorization') authHeader?: string
  ) {
    // Se tiver token no header, busca do marketplace (memória)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const loans = await this.marketplaceService.getMyLoans(token);
        
        // Se há loans no marketplace, usar esses dados
        if (loans && loans.length > 0) {
          // Calcular métricas dos loans do marketplace
          const fundedLoans = loans.filter(l => l.status === 'funded' || l.status === 'funding' || l.status === 'completed');
          const volumeTotal = fundedLoans.reduce((sum, l) => sum + l.currentFunding, 0);
          const totalRequested = loans.reduce((sum, l) => sum + l.requestedAmount, 0);
          const totalFunded = fundedLoans.reduce((sum, l) => sum + l.currentFunding, 0);
          const activeLoans = loans.filter(l => l.status === 'funding' || l.status === 'funded').length;
          
          // APY médio (simplificado - baseado na taxa máxima)
          const apyMedio = loans.length > 0
            ? loans.reduce((sum, l) => sum + l.maxInterestRate, 0) / loans.length
            : 0;
          
          // Taxa de sucesso
          const successfulLoans = fundedLoans.length;
          const taxaSucesso = loans.length > 0 
            ? (successfulLoans / loans.length) * 100 
            : 0;
          
          return {
            volumeTotal,
            apyMedio,
            taxaSucesso,
            totalFinanciado: totalFunded,
            totalRequested,
            totalFunded,
            activeLoans,
            proposals: loans,
            repaymentSchedules: [],
            upcomingPayments: []
          };
        }
        // Se não há loans no marketplace, fazer fallback para banco
        console.log('🔄 Nenhum loan no marketplace, fazendo fallback para banco de dados');
      } catch (error) {
        console.error('Erro ao buscar do marketplace:', error);
        // Fallback para proposals antigas
      }
    }
    
    // Tenta buscar pelo producerName primeiro (proposals antigas no SQL)
    const proposalsData = await this.proposalService.getProducerDashboard(producerIdentifier);
    
    // Se não houver proposals (banco vazio), retorna zeros mas não NaN
    if (!proposalsData.proposals || proposalsData.proposals.length === 0) {
      return {
        volumeTotal: 0,
        apyMedio: 0,
        taxaSucesso: 0,
        totalFinanciado: 0,
        totalRequested: 0,
        totalFunded: 0,
        activeLoans: 0,
        proposals: [],
        repaymentSchedules: [],
        upcomingPayments: []
      };
    }
    
    return proposalsData;
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

  // 📄 APIS DE VALIDAÇÃO DE DOCUMENTOS

  @Post('proposals/:id/validate-document')
  @UseInterceptors(FileInterceptor('file'))
  async validateProposalDocument(
    @Param('id') proposalId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        success: false,
        message: 'Arquivo é obrigatório',
      };
    }

    try {
      const validation = await this.documentValidationService.validateForCollateral(
        file,
        proposalId,
      );

      return {
        success: true,
        data: {
          proposalId,
          approved: validation.approved,
          isValid: validation.validationResult.isValid,
          confidence: validation.validationResult.confidence,
          riskScore: validation.riskScore,
          extractedText: validation.validationResult.extractedText,
          processedAt: validation.validationResult.processedAt,
        },
        message: validation.approved
          ? 'Documento validado e aprovado para garantia'
          : 'Documento não aprovado para garantia',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao validar documento',
        error: error.message,
      };
    }
  }

  @Post('validate-document-text')
  async validateDocumentText(@Body() body: { text: string; proposalId?: string }) {
    try {
      const result = await this.documentValidationService.validateText(
        body.text,
        body.proposalId,
      );

      return {
        success: true,
        data: result,
        message: result.isValid
          ? 'Documento válido'
          : 'Documento inválido ou suspeito',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao validar texto',
        error: error.message,
      };
    }
  }

  @Get('ml-health')
  async checkMLAPIHealth() {
    try {
      const health = await this.documentValidationService.checkMLAPIHealth();
      return {
        success: true,
        data: health,
        message: 'API ML está funcionando',
      };
    } catch (error) {
      return {
        success: false,
        message: 'API ML não disponível',
        error: error.message,
      };
    }
  }
}