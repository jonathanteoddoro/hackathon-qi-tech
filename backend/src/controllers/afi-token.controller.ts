import { Controller, Post, Get, Body, Headers, HttpException, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AgroFiTokenService } from '../services/agrofi-token.service';
import { UserManagementService } from '../services/user-management.service';

export interface AFIRequestDto {
  amount: number;
  documentType: 'cda' | 'wa' | 'cpr' | 'production_certificate' | 'harvest_report' | 'warehouse_receipt';
  description: string;
  expectedValue: number; // Valor da produção estimado
}

@Controller('api/afi')
export class AFITokenController {
  constructor(
    private readonly afiService: AgroFiTokenService,
    private readonly userService: UserManagementService
  ) {}

  @Post('request')
  @UseInterceptors(FileInterceptor('document', {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, cb) => {
      // Aceitar qualquer tipo de arquivo para demonstração
      console.log(`📁 [MOCK] Arquivo aceito: ${file.originalname} (${file.mimetype})`);
      cb(null, true);
    }
  }))
  async requestAFITokens(
    @Headers('authorization') authHeader: string,
    @Body() requestData: AFIRequestDto,
    @UploadedFile() document: Express.Multer.File
  ) {
    try {
      console.log('🌾 [AFI] Solicitação de AFI tokens iniciada');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token não fornecido');
      }

      const token = authHeader.split(' ')[1];
      const user = await this.userService.getUserFromToken(token);

      if (user.userType !== 'producer') {
        throw new Error('Apenas produtores podem solicitar AFI tokens');
      }

      if (!document) {
        throw new Error('Documento comprobatório é obrigatório');
      }

      console.log('📄 Documento recebido:', {
        name: document.originalname,
        size: document.size,
        type: document.mimetype
      });

      // Simular análise do documento e aprovação automática para desenvolvimento
      const analysisResult = await this.analyzeDocument(document, requestData);

      if (analysisResult.approved) {
        // Creditar AFI tokens
        const result = await this.afiService.mintTokensFromReais(
          user.smartAccountAddress,
          requestData.amount,
          `afi_request_${Date.now()}`
        );

        console.log(`✅ ${requestData.amount} AFI tokens creditados para ${user.profile.name}`);

        return {
          success: true,
          message: `${requestData.amount} AFI tokens creditados com sucesso`,
          data: {
            transactionHash: result.transactionHash,
            amount: requestData.amount,
            tokenAmount: result.tokenAmount,
            documentAnalysis: analysisResult
          },
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(`Documento rejeitado: ${analysisResult.reason}`);
      }

    } catch (error) {
      console.error('❌ [AFI] Erro na solicitação:', error);
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('balance')
  async getAFIBalance(@Headers('authorization') authHeader: string) {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token não fornecido');
      }

      const token = authHeader.split(' ')[1];
      const user = await this.userService.getUserFromToken(token);

      const balance = await this.afiService.getUserTokenBalance(user.smartAccountAddress);

      return {
        success: true,
        data: {
          balance: parseFloat(balance),
          address: user.smartAccountAddress,
          userType: user.userType
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ [AFI] Erro ao obter saldo:', error);
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter saldo',
          timestamp: new Date().toISOString()
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  @Get('transactions')
  async getAFITransactions(@Headers('authorization') authHeader: string) {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token não fornecido');
      }

      const token = authHeader.split(' ')[1];
      const user = await this.userService.getUserFromToken(token);

      // Por simplicidade, retornar histórico mock
      const transactions = [
        {
          id: 'tx_001',
          type: 'mint',
          amount: 1000,
          description: 'Certificado de produção de soja - Safra 2024',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'completed'
        },
        {
          id: 'tx_002',
          type: 'collateral',
          amount: -150,
          description: 'Colateral para empréstimo #loan_123',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      ];

      return {
        success: true,
        data: transactions,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ [AFI] Erro ao obter transações:', error);
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter transações',
          timestamp: new Date().toISOString()
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  private async analyzeDocument(
    document: Express.Multer.File,
    requestData: AFIRequestDto
  ): Promise<{ approved: boolean; reason?: string; confidence: number }> {

    // Mock - Análise de documento sempre aprovada
    console.log('🔍 [MOCK] Analisando documento...');
    console.log(`📋 Tipo: ${requestData.documentType}`);
    console.log(`💰 Valor solicitado: ${requestData.amount} AFI`);
    console.log(`📄 Arquivo: ${document.originalname} (${document.size} bytes)`);

    // Validações básicas apenas para evitar erros
    if (document.size > 50 * 1024 * 1024) { // 50MB - limite mais alto
      return {
        approved: false,
        reason: 'Arquivo muito grande. Máximo 50MB.',
        confidence: 0
      };
    }

    if (requestData.amount > 1000000) { // 1 milhão - limite mais alto
      return {
        approved: false,
        reason: 'Valor muito alto. Máximo 1,000,000 AFI por solicitação.',
        confidence: 0
      };
    }

    // MOCK: Aprovação automática para qualquer documento
    console.log('✅ [MOCK] Documento aprovado automaticamente');
    return {
      approved: true,
      confidence: 1.0
    };
  }
}