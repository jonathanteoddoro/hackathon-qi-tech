import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { afiAPI, type AFIRequestData, type AFIBalance, type AFITransaction } from '../services/afi-api';

export default function AFITokenRequest() {
  const [formData, setFormData] = useState<AFIRequestData>({
    amount: 0,
    documentType: 'cda',
    description: '',
    expectedValue: 0
  });

  const [document, setDocument] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [afiBalance, setAFIBalance] = useState<AFIBalance | null>(null);
  const [transactions, setTransactions] = useState<AFITransaction[]>([]);

  useEffect(() => {
    loadAFIData();
  }, []);

  const loadAFIData = async () => {
    try {
      const token = localStorage.getItem('agrofi_token');
      if (!token) return;

      const [balance, txHistory] = await Promise.all([
        afiAPI.getAFIBalance(token),
        afiAPI.getAFITransactions(token)
      ]);

      setAFIBalance(balance);
      setTransactions(txHistory);
    } catch (error) {
      console.error('Erro ao carregar dados AFI:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) {
      setMessage({ type: 'error', text: 'Por favor, selecione um documento' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('agrofi_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const result = await afiAPI.requestAFITokens(formData, document, token);

      setMessage({
        type: 'success',
        text: `${result.data?.amount} AFI tokens creditados com sucesso!`
      });

      // Reset form
      setFormData({
        amount: 0,
        documentType: 'cda',
        description: '',
        expectedValue: 0
      });
      setDocument(null);

      // Reload data
      await loadAFIData();

    } catch (error) {
      console.error('Erro ao solicitar AFI tokens:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao solicitar AFI tokens'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocument(file);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'mint': return '🌟';
      case 'collateral': return '🔒';
      case 'transfer': return '💸';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
          {/* Formulário de Solicitação */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <FileText className="h-6 w-6 text-green-600" />
                Solicitar AFI Tokens
              </h2>
              <p className="text-gray-600">
                Envie documentos comprobatórios para receber AFI tokens baseados na sua produção agrícola
              </p>
            </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="expectedValue" className="text-sm font-semibold text-gray-700">
                  Valor do Documento (R$) *
                </Label>
                <Input
                  id="expectedValue"
                  type="number"
                  value={formData.expectedValue}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFormData({ 
                      ...formData, 
                      expectedValue: value,
                      amount: value // 1:1 ratio - valor em reais = tokens AFI
                    });
                  }}
                  placeholder="Ex: 150000"
                  required
                  className="h-12 text-lg border-2 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
                <p className="text-sm text-gray-600">
                  Valor monetário do documento de garantia
                </p>
              </div>

            </div>


            <div className="space-y-3">
              <Label htmlFor="documentType" className="text-sm font-semibold text-gray-700">
                Tipo de Documento *
              </Label>
              <select
                id="documentType"
                className="w-full h-12 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
              >
                <option value="cda">Documento de Propriedade</option>
              </select>
              <p className="text-sm text-gray-600">
                Escolha o tipo de documento agrícola
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Adicional</Label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Informações adicionais sobre o documento, localização do armazém, safra, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Documento de Garantia *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="document" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        {document ? `📄 ${document.name}` : 'Clique para fazer upload do documento'}
                      </span>
                      <span className="text-xs text-gray-500 block mt-1">
                        PDF, JPG, PNG, DOC, TXT até 50MB
                      </span>
                    </label>
                    <input
                      id="document"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Processando...' : 'Solicitar AFI Tokens'}
            </Button>
          </form>
          </div>

          {/* Histórico de Transações */}
    </div>
  );
}