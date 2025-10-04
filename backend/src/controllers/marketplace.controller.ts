import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { MarketplaceService } from '../services/marketplace.service';
import type { CreateLoanRequestDto, InvestInLoanDto } from '../services/marketplace.service';

@Controller('api/marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // 📋 Listar todas as solicitações de empréstimo
  @Get('loans')
  async getAllLoans() {
    try {
      const loans = await this.marketplaceService.getAllLoanRequests();
      return {
        success: true,
        data: loans,
        message: 'Empréstimos carregados com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao carregar empréstimos',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ➕ Criar nova solicitação de empréstimo
  @Post('loans')
  async createLoan(@Body() createLoanDto: CreateLoanRequestDto, @Headers('authorization') authHeader: string) {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token de autorização necessário');
      }

      const token = authHeader.substring(7);
      const loanData = { ...createLoanDto, producerToken: token };
      
      const loan = await this.marketplaceService.createLoanRequest(loanData);
      
      return {
        success: true,
        data: loan,
        message: 'Solicitação de empréstimo criada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao criar solicitação',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 💰 Investir em empréstimo (transação real na blockchain)
  @Post('invest')
  async investInLoan(@Body() investDto: InvestInLoanDto, @Headers('authorization') authHeader: string) {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token de autorização necessário');
      }

      const token = authHeader.substring(7);
      const investmentData = { ...investDto, investorToken: token };
      
      console.log('🚀 Processando investimento:', {
        loanId: investDto.loanId,
        amount: investDto.investmentAmount,
        timestamp: new Date().toISOString()
      });

      const result = await this.marketplaceService.investInLoan(investmentData);
      
      if (result.success) {
        return {
          success: true,
          data: {
            transactionHash: result.transactionHash,
            updatedLoan: result.updatedLoan
          },
          message: 'Investimento realizado com sucesso! Transação enviada para a blockchain.'
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Erro no investimento:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao processar investimento',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 📊 Buscar empréstimos de um produtor
  @Get('my-loans')
  async getMyLoans(@Headers('authorization') authHeader: string) {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token de autorização necessário');
      }

      const token = authHeader.substring(7);
      
      // Extrair userId do token para buscar empréstimos
      const user = await this.marketplaceService['aaService'].getUserFromToken(token);
      const loans = await this.marketplaceService.getProducerLoans(user.id);
      
      return {
        success: true,
        data: loans,
        message: 'Empréstimos do produtor carregados'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao carregar empréstimos',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 📈 Buscar investimentos de um investidor
  @Get('my-investments')
  async getMyInvestments(@Headers('authorization') authHeader: string) {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token de autorização necessário');
      }

      const token = authHeader.substring(7);
      
      // Extrair userId do token para buscar investimentos
      const user = await this.marketplaceService['aaService'].getUserFromToken(token);
      const investments = await this.marketplaceService.getInvestorInvestments(user.id);
      
      return {
        success: true,
        data: investments,
        message: 'Investimentos carregados'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao carregar investimentos',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 🔍 Buscar empréstimo específico
  @Get('loans/:id')
  async getLoanById(@Headers('authorization') authHeader: string) {
    try {
      // TODO: Implementar busca por ID específico
      return {
        success: false,
        message: 'Endpoint em desenvolvimento'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao buscar empréstimo',
        timestamp: new Date().toISOString()
      };
    }
  }
}