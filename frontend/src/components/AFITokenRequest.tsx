import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Coins } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* Saldo AFI */}
      {afiBalance && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-green-600" />
              Saldo AFI Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-700">
                  {afiBalance.balance.toLocaleString()} AFI
                </p>
                <p className="text-sm text-gray-600">
                  Endereço: {afiBalance.address.substring(0, 10)}...{afiBalance.address.substring(afiBalance.address.length - 8)}
                </p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700">
                {afiBalance.userType === 'producer' ? 'Produtor' : 'Investidor'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Solicitação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Solicitar AFI Tokens
          </CardTitle>
          <CardDescription>
            Envie documentos comprobatórios para receber AFI tokens baseados na sua produção agrícola
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Aviso de Demonstração */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <h4 className="font-medium text-yellow-800">Ambiente de Demonstração</h4>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Qualquer documento será aceito automaticamente para fins de demonstração. 
              Em produção, haveria validação rigorosa de CDA, WA e outros documentos de garantia.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedValue">Valor do Documento (R$) *</Label>
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
                />
                <p className="text-xs text-gray-500">
                  Valor monetário do documento de garantia
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sojaQuantity">Quantidade de Soja (sacas)</Label>
                <Input
                  id="sojaQuantity"
                  type="number"
                  placeholder="Ex: 1000"
                />
                <p className="text-xs text-gray-500">
                  Quantidade de soja referente ao documento
                </p>
              </div>
            </div>

            {formData.expectedValue > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-700 mb-2">📊 Estimativa de Tokens</h4>
                <p className="text-sm text-blue-600">
                  Baseado no valor de <strong>R$ {formData.expectedValue.toLocaleString()}</strong>, 
                  você receberá aproximadamente <strong>{formData.expectedValue.toLocaleString()} AFI tokens</strong> 
                  após validação do documento.
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  Relação 1:1 - R$ 1,00 = 1 AFI Token
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento *</Label>
              <select
                id="documentType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
              >
                <option value="cda">CDA - Certificado de Depósito Agropecuário</option>
                <option value="wa">WA - Warrant Agropecuário</option>
                <option value="cpr">CPR - Cédula de Produto Rural</option>
                <option value="production_certificate">Certificado de Produção</option>
                <option value="harvest_report">Relatório de Colheita</option>
                <option value="warehouse_receipt">Recibo de Armazém</option>
              </select>
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
                      <span className="text-xs text-blue-600 block mt-1">
                        Qualquer documento é aceito para demonstração
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
        </CardContent>
      </Card>

      {/* Histórico de Transações */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações AFI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getTransactionIcon(tx.type)}</span>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-gray-600">
                        {tx.timestamp.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} AFI
                    </p>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}