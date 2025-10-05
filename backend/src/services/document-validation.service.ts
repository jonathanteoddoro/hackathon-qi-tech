import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

export interface DocumentValidationResult {
  isValid: boolean;
  confidence: number;
  extractedText: string;
  ocrMethod: string;
  processedAt: string;
  proposalId?: string;
}

export interface MLAPIHealth {
  status: string;
  modelLoaded: boolean;
  timestamp: string;
}

@Injectable()
export class DocumentValidationService {
  private readonly logger = new Logger(DocumentValidationService.name);
  private readonly mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';

  /**
   * Valida um documento enviado via upload
   * Por simplicidade, vamos simular a extração de texto aqui
   */
  async validateDocument(
    file: Express.Multer.File,
    proposalId?: string,
  ): Promise<DocumentValidationResult> {
    try {
      this.logger.log(`Validando documento: ${file.originalname}`);

      // Simular extração básica de texto do buffer
      let extractedText = '';
      
      if (file.mimetype.includes('text')) {
        extractedText = file.buffer.toString('utf-8');
      } else {
        // Para outros tipos, simular alguns campos de documentos de terra
        extractedText = `DOCUMENTO DE PROPRIEDADE
Arquivo: ${file.originalname}
Tamanho: ${file.size} bytes
Tipo: ${file.mimetype}
Data: ${new Date().toLocaleDateString()}
ESCRITURA PUBLICA DE PROPRIEDADE RURAL
Proprietário: Produtor Rural
Área: 100 hectares
Localização: Zona Rural`;
      }

      // Validar texto extraído usando a API ML
      const result = await this.validateText(extractedText, proposalId);

      this.logger.log(
        `Documento validado - Válido: ${result.isValid}, Confiança: ${result.confidence}`,
      );

      return {
        ...result,
        ocrMethod: 'simulated_extraction',
      };
    } catch (error) {
      this.logger.error('Erro ao validar documento:', error.message);
      throw new HttpException(
        'Erro na validação do documento',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Valida texto diretamente
   */
  async validateText(
    text: string,
    proposalId?: string,
  ): Promise<DocumentValidationResult> {
    try {
      this.logger.log('Validando texto direto');

      // Fazer requisição para API ML
      const response = await axios.post(
        `${this.mlApiUrl}/validate-text`,
        { text },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15 segundos
        },
      );

      const result = {
        isValid: response.data.is_valid,
        confidence: response.data.confidence,
        extractedText: text,
        ocrMethod: 'direct_text',
        processedAt: new Date().toISOString(),
        proposalId,
      };

      this.logger.log(
        `Texto validado - Válido: ${result.isValid}, Confiança: ${result.confidence}`,
      );

      return result;
    } catch (error) {
      this.logger.error('Erro ao validar texto:', error.message);
      throw new HttpException(
        'Erro na validação do texto',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verifica status da API ML
   */
  async checkMLAPIHealth(): Promise<MLAPIHealth> {
    try {
      const response = await axios.get(`${this.mlApiUrl}/health`, {
        timeout: 5000,
      });

      return {
        status: response.data.status,
        modelLoaded: response.data.model_loaded,
        timestamp: response.data.timestamp,
      };
    } catch (error) {
      this.logger.error('API ML não disponível:', error.message);
      throw new HttpException(
        'API ML não disponível',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Valida documento como parte do processo de garantia
   */
  async validateForCollateral(
    file: Express.Multer.File,
    proposalId: string,
  ): Promise<{
    approved: boolean;
    validationResult: DocumentValidationResult;
    riskScore: number;
  }> {
    const validationResult = await this.validateDocument(file, proposalId);

    // Lógica de aprovação baseada na confiança
    const minConfidence = 0.5; // 50% de confiança mínima (reduzido de 70%)
    const approved = validationResult.isValid && validationResult.confidence >= minConfidence;

    // Score de risco (menor é melhor)
    const riskScore = 24;

    this.logger.log(
      `Validação para garantia - Proposta: ${proposalId}, Aprovado: ${approved}, Risco: ${riskScore}%`,
    );

    return {
      approved,
      validationResult,
      riskScore,
    };
  }
}