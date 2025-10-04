import { Controller, Get, Post, Body, Param, Headers, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MarketplaceService } from '../services/marketplace.service';
import type { CreateLoanRequestDto, InvestInLoanDto } from '../services/marketplace.service';

@Controller('marketplace')
export class MarketplaceController {
  private readonly logger = new Logger(MarketplaceController.name);

  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('loans')
  async getAllLoans() {
    try {
      this.logger.log('📋 Buscando todos os empréstimos');
      const loans = await this.marketplaceService.getAllLoanRequests();

      return {
        success: true,
        data: loans,
        message: 'Empréstimos carregados com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      this.logger.error('Erro ao buscar empréstimos:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('loans/:id')
  async getLoanById(@Param('id') loanId: string) {
    try {
      this.logger.log(`🔍 Buscando empréstimo: ${loanId}`);
      const loan = await this.marketplaceService.getLoanById(loanId);

      if (!loan) {
        throw new HttpException(
          {
            success: false,
            message: 'Empréstimo não encontrado',
            timestamp: new Date().toISOString()
          },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        data: loan,
        message: 'Empréstimo encontrado',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Erro ao buscar empréstimo:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('loans')
  async createLoan(@Body() createLoanDto: CreateLoanRequestDto) {
    try {
      this.logger.log('📝 Criando novo empréstimo');

      if (!createLoanDto.producerToken) {
        throw new HttpException(
          {
            success: false,
            message: 'Token do produtor é obrigatório',
            timestamp: new Date().toISOString()
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const loan = await this.marketplaceService.createLoanRequest(createLoanDto);

      return {
        success: true,
        data: loan,
        message: 'Empréstimo criado com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      this.logger.error('Erro ao criar empréstimo:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('loans/:id/invest')
  async investInLoan(
    @Param('id') loanId: string,
    @Body() investDto: Omit<InvestInLoanDto, 'loanId'>,
    @Headers('authorization') authHeader?: string
  ) {
    try {
      this.logger.log(`💰 Processando investimento no empréstimo: ${loanId}`);

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException(
          {
            success: false,
            message: 'Token de autorização necessário',
            timestamp: new Date().toISOString()
          },
          HttpStatus.UNAUTHORIZED
        );
      }

      const token = authHeader.substring(7);
      const investData: InvestInLoanDto = {
        ...investDto,
        loanId,
        investorToken: token
      };

      const result = await this.marketplaceService.investInLoan(investData);

      if (!result.success) {
        throw new HttpException(
          {
            success: false,
            message: result.error,
            timestamp: new Date().toISOString()
          },
          HttpStatus.BAD_REQUEST
        );
      }

      return {
        success: true,
        data: {
          transactionHash: result.transactionHash,
          updatedLoan: result.updatedLoan
        },
        message: 'Investimento realizado com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Erro no investimento:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('my-loans')
  async getMyLoans(@Headers('authorization') authHeader?: string) {
    try {
      this.logger.log('📋 Buscando empréstimos do produtor');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException(
          {
            success: false,
            message: 'Token de autorização necessário',
            timestamp: new Date().toISOString()
          },
          HttpStatus.UNAUTHORIZED
        );
      }

      const token = authHeader.substring(7);
      const loans = await this.marketplaceService.getMyLoans(token);

      return {
        success: true,
        data: loans,
        message: 'Empréstimos do produtor carregados',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      this.logger.error('Erro ao buscar empréstimos do produtor:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('my-investments')
  async getMyInvestments(@Headers('authorization') authHeader?: string) {
    try {
      this.logger.log('💼 Buscando investimentos do usuário');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException(
          {
            success: false,
            message: 'Token de autorização necessário',
            timestamp: new Date().toISOString()
          },
          HttpStatus.UNAUTHORIZED
        );
      }

      const token = authHeader.substring(7);
      const investments = await this.marketplaceService.getMyInvestments(token);

      return {
        success: true,
        data: investments,
        message: 'Investimentos carregados',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      this.logger.error('Erro ao buscar investimentos:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  async getMarketplaceStats() {
    try {
      this.logger.log('📊 Buscando estatísticas do marketplace');
      const stats = await this.marketplaceService.getMarketplaceStats();

      return {
        success: true,
        data: stats,
        message: 'Estatísticas carregadas',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      this.logger.error('Erro ao buscar estatísticas:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('loans/:id/position')
  async getLoanPosition(
    @Param('id') loanId: string,
    @Headers('authorization') authHeader?: string
  ) {
    try {
      this.logger.log(`🔍 Buscando posição no empréstimo: ${loanId}`);

      if (!loanId || loanId === 'undefined') {
        throw new HttpException(
          {
            success: false,
            message: 'ID do empréstimo é obrigatório',
            timestamp: new Date().toISOString()
          },
          HttpStatus.BAD_REQUEST
        );
      }

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpException(
          {
            success: false,
            message: 'Token de autorização necessário',
            timestamp: new Date().toISOString()
          },
          HttpStatus.UNAUTHORIZED
        );
      }

      const token = authHeader.substring(7);
      const position = await this.marketplaceService.getP2PPosition(loanId, token);

      return {
        success: true,
        data: position,
        message: 'Posição no empréstimo',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      this.logger.error('Erro ao buscar posição:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('config')
  async getMorphoConfig() {
    try {
      this.logger.log('⚙️ Buscando configurações do Morpho');
      const config = await this.marketplaceService.getMorphoConfig();

      return {
        success: true,
        data: config,
        message: 'Configurações do Morpho carregadas',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      this.logger.error('Erro ao buscar configurações:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}