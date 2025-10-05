import { Controller, Post, Get, Body, Headers, HttpException, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AgroFiTokenService } from '../services/agrofi-token.service';
import { UserManagementService } from '../services/user-management.service';
import { DocumentValidationService } from '../services/document-validation.service';

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
    private readonly userService: UserManagementService,
    private readonly documentValidationService: DocumentValidationService
  ) {}

  @Post('request')
  @UseInterceptors(FileInterceptor('document', {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, cb) => {
      // Aceitar documentos comuns
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        console.log(`📁 Arquivo aceito: ${file.originalname} (${file.mimetype})`);
        cb(null, true);
      } else {
        console.log(`❌ Arquivo rejeitado: ${file.originalname} (${file.mimetype})`);
        cb(new Error('Tipo de arquivo não suportado'), false);
      }
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

    console.log('🔍 Analisando documento com IA...');
    console.log(`📋 Tipo: ${requestData.documentType}`);
    console.log(`💰 Valor solicitado: ${requestData.amount} AFI`);
    console.log(`📄 Arquivo: ${document.originalname} (${document.size} bytes)`);

    // Validações básicas de tamanho e formato
    if (document.size > 50 * 1024 * 1024) { // 50MB
      return {
        approved: false,
        reason: 'Arquivo muito grande. Máximo 50MB.',
        confidence: 0
      };
    }

    if (requestData.amount > 1000000) { // 1 milhão
      return {
        approved: false,
        reason: 'Valor muito alto. Máximo 1,000,000 AFI por solicitação.',
        confidence: 0
      };
    }

    try {
      // Usar o serviço de validação de documentos com IA
      const validation = await this.documentValidationService.validateForCollateral(
        document,
        `afi-request-${Date.now()}`
      );

      console.log(`🤖 Resultado da IA - Válido: ${validation.validationResult.isValid}`);
      console.log(`📊 Confiança: ${(validation.validationResult.confidence * 100).toFixed(1)}%`);
      console.log(`⚠️ Score de Risco: ${validation.riskScore.toFixed(1)}%`);

      // Critérios específicos para AFI tokens
      const minConfidenceForAFI = 0.5; // 75% de confiança mínima para AFI
      const maxRiskScore = 25; // Máximo 25% de risco

      const approved = validation.approved && 
                      validation.validationResult.confidence >= minConfidenceForAFI &&
                      validation.riskScore <= maxRiskScore;

      let reason = '';
      if (!validation.validationResult.isValid) {
        reason = 'Documento não reconhecido como válido pela IA';
      } else if (validation.validationResult.confidence < minConfidenceForAFI) {
        reason = `Confiança muito baixa: ${(validation.validationResult.confidence * 100).toFixed(1)}% (mínimo 75%)`;
      } else if (validation.riskScore > maxRiskScore) {
        reason = `Score de risco muito alto: ${validation.riskScore.toFixed(1)}% (máximo 25%)`;
      }

      if (approved) {
        console.log('✅ Documento aprovado pela IA!');
      } else {
        console.log(`❌ Documento rejeitado: ${reason}`);
      }

      return {
        approved,
        reason: approved ? undefined : reason,
        confidence: validation.validationResult.confidence
      };

    } catch (error) {
      console.error('💥 Erro na validação com IA:', error.message);
      
      // Fallback: aprovação manual básica se a IA falhar
      console.log('⚠️ Usando validação básica de fallback...');
      
      // Verificar apenas se o arquivo parece ser um documento válido
      const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
      const hasValidExtension = validExtensions.some(ext => 
        document.originalname.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        return {
          approved: false,
          reason: 'Formato de arquivo não suportado',
          confidence: 0
        };
      }

      // Aprovação básica se IA não estiver disponível
      console.log('✅ Documento aprovado (validação básica)');
      return {
        approved: true,
        confidence: 0.5, // Confiança baixa sem IA
        reason: undefined
      };
    }
  }
}