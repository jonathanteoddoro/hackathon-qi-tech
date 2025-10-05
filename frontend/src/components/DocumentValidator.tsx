import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Componentes inline para resolver problemas de importação
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }> = ({
  className = '',
  ...props
}) => {
  return (
    <textarea
      className={`
        flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
        ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
        disabled:cursor-not-allowed disabled:opacity-50 resize-none
        ${className}
      `}
      {...props}
    />
  );
};

const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-start gap-3 p-4 border rounded-lg ${className}`}>
      {children}
    </div>
  );
};

const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex-1 ${className}`}>
      {children}
    </div>
  );
};

interface ValidationResult {
  success: boolean;
  data?: {
    proposalId: string;
    approved: boolean;
    isValid: boolean;
    confidence: number;
    riskScore: number;
    extractedText: string;
    processedAt: string;
  };
  message: string;
  error?: string;
}

interface DocumentValidatorProps {
  proposalId?: string;
  onValidationComplete?: (result: ValidationResult) => void;
}

export const DocumentValidator: React.FC<DocumentValidatorProps> = ({
  proposalId,
  onValidationComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [mode, setMode] = useState<'upload' | 'text'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const validateDocument = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = proposalId 
        ? `/api/proposals/${proposalId}/validate-document`
        : '/api/validate-document';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data: ValidationResult = await response.json();
      setResult(data);
      onValidationComplete?.(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao conectar com o servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/validate-document-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          proposalId,
        }),
      });

      const data: ValidationResult = await response.json();
      setResult(data);
      onValidationComplete?.(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao conectar com o servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderValidationResult = () => {
    if (!result) return null;

    const { success, data, message, error } = result;

    if (!success) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Erro:</strong> {message}
            {error && <div className="text-sm mt-1 opacity-75">{error}</div>}
          </AlertDescription>
        </Alert>
      );
    }

    if (!data) return null;

    const getStatusIcon = () => {
      if (data.approved) return <CheckCircle className="h-5 w-5 text-green-600" />;
      if (data.isValid) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      return <XCircle className="h-5 w-5 text-red-600" />;
    };

    const getStatusColor = () => {
      if (data.approved) return 'border-green-200 bg-green-50';
      if (data.isValid) return 'border-yellow-200 bg-yellow-50';
      return 'border-red-200 bg-red-50';
    };

    const getStatusText = () => {
      if (data.approved) return 'text-green-800';
      if (data.isValid) return 'text-yellow-800';
      return 'text-red-800';
    };

    return (
      <Alert className={getStatusColor()}>
        {getStatusIcon()}
        <AlertDescription className={getStatusText()}>
          <div className="space-y-2">
            <div className="font-semibold">{message}</div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Status:</span>{' '}
                {data.approved ? 'Aprovado' : data.isValid ? 'Válido' : 'Inválido'}
              </div>
              <div>
                <span className="font-medium">Confiança:</span>{' '}
                {(data.confidence * 100).toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Score de Risco:</span>{' '}
                {data.riskScore.toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Processado:</span>{' '}
                {new Date(data.processedAt).toLocaleString()}
              </div>
            </div>

            {data.extractedText && (
              <div className="mt-3">
                <span className="font-medium">Texto Extraído:</span>
                <div className="mt-1 p-2 bg-white/50 rounded text-xs max-h-20 overflow-y-auto">
                  {data.extractedText.substring(0, 200)}
                  {data.extractedText.length > 200 && '...'}
                </div>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Validação de Documentos de Garantia com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('upload')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload de Arquivo
          </Button>
          <Button
            variant={mode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('text')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Texto Direto
          </Button>
        </div>

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Aceita: PDF, DOC, TXT, JPG, PNG (máx. 50MB)
              </p>
            </div>

            {file && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm">
                  <span className="font-medium">Arquivo:</span> {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  Tamanho: {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <Button
              onClick={validateDocument}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? 'Validando com IA...' : 'Validar Documento'}
            </Button>
          </div>
        )}

        {/* Text Mode */}
        {mode === 'text' && (
          <div className="space-y-4">
            <Textarea
              placeholder="Cole aqui o texto do documento de propriedade rural ou CDA para validação com IA..."
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
              rows={6}
            />

            <Button
              onClick={validateText}
              disabled={!text.trim() || loading}
              className="w-full"
            >
              {loading ? 'Validando com IA...' : 'Validar Texto'}
            </Button>
          </div>
        )}

        {/* Results */}
        {renderValidationResult()}

        {/* Help Text */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <strong>💡 Sistema IA Rigoroso:</strong> O sistema só aprova documentos legítimos de propriedade rural, escrituras, CDAs (Certificados de Depósito Agropecuário) e documentos oficiais relacionados à agricultura. CVs, documentos acadêmicos e textos genéricos são automaticamente rejeitados.
        </div>

        {/* Proposal ID */}
        {proposalId && (
          <div className="text-xs text-gray-500 border-t pt-2">
            Proposta: {proposalId}
          </div>
        )}
      </CardContent>
    </Card>
  );
};