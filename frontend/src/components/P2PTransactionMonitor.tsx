import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Shield
} from 'lucide-react';

interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  gasUsed?: string;
  blockNumber?: number;
  timestamp?: number;
}

interface P2PTransactionMonitorProps {
  transactionHash: string;
  loanId: string;
  expectedAmount: number;
  onStatusChange?: (status: TransactionStatus) => void;
}

export default function P2PTransactionMonitor({
  transactionHash,
  loanId,
  expectedAmount,
  onStatusChange
}: P2PTransactionMonitorProps) {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({
    hash: transactionHash,
    status: 'pending',
    confirmations: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // Simular monitoramento de transação
  useEffect(() => {
    if (!isMonitoring || txStatus.status !== 'pending') return;

    const checkTransaction = async () => {
      try {
        // Simular verificação da transação na blockchain
        // Em produção, usaria ethers.js para verificar o status real
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular progresso gradual
        setTxStatus(prev => {
          const newConfirmations = Math.min(prev.confirmations + Math.floor(Math.random() * 3) + 1, 12);
          const newStatus = newConfirmations >= 12 ? 'confirmed' : 'pending';

          const newTxStatus = {
            ...prev,
            confirmations: newConfirmations,
            status: newStatus,
            blockNumber: newStatus === 'confirmed' ? 5234567 + Math.floor(Math.random() * 1000) : undefined,
            gasUsed: newStatus === 'confirmed' ? (Math.random() * 200000 + 50000).toFixed(0) : undefined,
            timestamp: newStatus === 'confirmed' ? Date.now() : undefined
          };

          if (onStatusChange) {
            onStatusChange(newTxStatus);
          }

          return newTxStatus;
        });

        setLastChecked(new Date());
      } catch (error) {
        console.error('Erro ao verificar transação:', error);
        setTxStatus(prev => ({ ...prev, status: 'failed' }));
      }
    };

    const interval = setInterval(checkTransaction, 5000);

    // Verificação inicial
    checkTransaction();

    return () => clearInterval(interval);
  }, [isMonitoring, txStatus.status, onStatusChange]);

  // Parar monitoramento quando confirmado
  useEffect(() => {
    if (txStatus.status === 'confirmed' || txStatus.status === 'failed') {
      setIsMonitoring(false);
    }
  }, [txStatus.status]);

  const getStatusIcon = () => {
    switch (txStatus.status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (txStatus.status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusText = () => {
    switch (txStatus.status) {
      case 'pending':
        return 'Aguardando Confirmação';
      case 'confirmed':
        return 'P2P Lending Confirmado';
      case 'failed':
        return 'Transação Falhou';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          🏦 Monitor de Transação P2P
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Status Principal */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
          <span className="text-sm text-gray-500">
            {txStatus.confirmations}/12 confirmações
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da Confirmação</span>
            <span>{Math.round((txStatus.confirmations / 12) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                txStatus.status === 'confirmed' ? 'bg-green-500' :
                txStatus.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((txStatus.confirmations / 12) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Detalhes da Transação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Hash da Transação</p>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono truncate flex-1">
                {txStatus.hash}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txStatus.hash}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-gray-600">Valor do P2P Lending</p>
            <p className="font-bold text-blue-600">{formatCurrency(expectedAmount)}</p>
          </div>

          {txStatus.blockNumber && (
            <div>
              <p className="text-gray-600">Block Number</p>
              <p className="font-mono">{txStatus.blockNumber.toLocaleString()}</p>
            </div>
          )}

          {txStatus.gasUsed && (
            <div>
              <p className="text-gray-600">Gas Usado</p>
              <p className="font-mono">{Number(txStatus.gasUsed).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Informações Morpho Blue */}
        {txStatus.status === 'confirmed' && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">P2P Lending Ativo via Morpho Blue</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>✅ Colateral AFI do produtor bloqueado automaticamente</p>
              <p>✅ Posição P2P criada na blockchain</p>
              <p>✅ Seus USDC transferidos para o produtor</p>
              <p>✅ Você recebe juros sobre o empréstimo</p>
              <p>✅ Health factor sendo monitorado</p>
            </div>
          </div>
        )}

        {/* Estatísticas de Rede */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Última verificação: {lastChecked.toLocaleTimeString('pt-BR')}</span>
            </div>
            {isMonitoring && (
              <div className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Monitorando...</span>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsMonitoring(!isMonitoring);
              if (!isMonitoring) {
                setLastChecked(new Date());
              }
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {isMonitoring ? 'Pausar' : 'Retomar'} Monitoramento
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txStatus.hash}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Ver no Etherscan
          </Button>
        </div>

        {/* Timeline de Eventos */}
        {txStatus.status === 'confirmed' && (
          <div className="border-t pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Timeline do P2P Lending:</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Transação enviada para a blockchain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Colateral AFI do produtor verificado e bloqueado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Posição P2P criada via Morpho Blue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Monitoramento de health factor ativado</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}