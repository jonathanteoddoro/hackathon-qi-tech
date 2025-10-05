import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sprout,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Shield,
  MapPin,
  Wallet,
  Info,
  ChevronRight,
  Star,
  Clock,
  Coins,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Calendar,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceAPIReal, type LoanRequest, type CreateLoanRequest, type P2PPosition, type Investment } from '../services/marketplace-real-api';
import { afiAPI } from '../services/afi-api';
import UserHeader from './UserHeader';
import AFITokenRequest from './AFITokenRequest';
import ProducerPayments from './ProducerPayments';

// Dados mockados baseados no projeto
export default function AgroFiMarketplace() {
  const { user, token } = useAuth();
  const [selectedTab, setSelectedTab] = useState('marketplace');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  
  // Estados para dados reais
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [error, setError] = useState('');

  // Estados para o fluxo P2P
  const [p2pStatus, setP2pStatus] = useState<'idle' | 'validating' | 'creating' | 'transferring' | 'completed' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [showP2pFlow, setShowP2pFlow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [estimatedCollateral, setEstimatedCollateral] = useState(0);
  const [healthFactor, setHealthFactor] = useState(0);

  // Estados para posições P2P e investimentos
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
  const [myLoans, setMyLoans] = useState<LoanRequest[]>([]);
  const [p2pPositions, setP2pPositions] = useState<Record<string, P2PPosition>>({});
  const [loadingPositions, setLoadingPositions] = useState(false);

  // Estados para notificações
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Saldo inicial do investidor (pode vir do backend futuramente)
  const INITIAL_BALANCE = 15000; // R$ 15.000,00 inicial

  // Estados para dashboard do produtor
  const [producerDashboard, setProducerDashboard] = useState<{
    volumeTotal: number;
    apyMedio: number;
    taxaSucesso: number;
    totalFinanciado: number;
  } | null>(null);

  // Estado para saldo AFI em tokens e valor em reais
  const [afiBalance, setAfiBalance] = useState<{
    tokens: number;
    valueInReais: number;
  } | null>(null);

  // Calculate real market data from actual loans
  const marketData = useMemo(() => {
    if (loans.length === 0) {
      return {
        totalValue: 0,
        averageAPY: 0,
        successRate: 0,
        totalFunded: 0,
        totalLoanRequests: 0,
        totalVolume: 0
      };
    }

    const totalRequested = loans.reduce((sum: number, loan: any) => sum + (loan.requestedAmount || 0), 0);
    const totalFunded = loans.reduce((sum: number, loan: any) => sum + (loan.currentFunding || 0), 0);
    const averageAPY = loans.reduce((sum: number, loan: any) => sum + (loan.projectedAPY || loan.maxInterestRate || 0), 0) / loans.length;
    
    // Para investidores: Taxa de sucesso = % de empréstimos pagos com sucesso (completed)
    const completedLoans = loans.filter((loan: any) => loan.status === 'completed').length;
    const activeLoans = loans.filter((loan: any) => ['funded', 'active', 'completed'].includes(loan.status)).length;
    const successRate = activeLoans > 0 ? (completedLoans / activeLoans) * 100 : 0;

    return {
      totalValue: totalRequested,
      averageAPY: isNaN(averageAPY) ? 0 : averageAPY,
      successRate: isNaN(successRate) ? 0 : successRate,
      totalFunded: isNaN(totalFunded) ? 0 : totalFunded,
      totalLoanRequests: loans.length,
      totalVolume: isNaN(totalRequested) ? 0 : totalRequested
    };
  }, [loans]);
  
  // Função helper para exibir notificações
  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    // Auto-hide após 5 segundos
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  // Estados para criação de empréstimo
  const [loanForm, setLoanForm] = useState<CreateLoanRequest>({
    requestedAmount: 0,
    termMonths: 6,
    maxInterestRate: 12.0,
    collateralAmount: 0,
    collateralType: 'soja',
    warehouseLocation: 'sorriso'
  });
  
  // Usar o tipo de usuário da autenticação se disponível, senão padrão para investidor
  const userType = user?.userType || 'investor';
  
  // Debug temporário
  console.log('🐛 Debug userType:', userType);
  console.log('🐛 Debug user:', user);
  console.log('🐛 Debug token:', token);

  // Carregar empréstimos ao montar o componente
  useEffect(() => {
    loadLoans();
    if (token) {
      loadUserData();
    }
  }, [token]);

  // Carregar dados do usuário logado
  const loadUserData = async () => {
    if (!token) return;

    try {
      if (userType === 'investor') {
        const investments = await marketplaceAPIReal.getMyInvestments(token);
        setMyInvestments(investments);

        // Carregar posições P2P para cada investimento
        setLoadingPositions(true);
        const positions: Record<string, P2PPosition> = {};
        for (const investment of investments) {
          try {
            // O backend retorna { loan, investment }, então precisamos acessar investment.loan.id
            const loanId = investment.loan?.id;
            if (loanId) {
              const position = await marketplaceAPIReal.getP2PPosition(loanId, token);
              positions[loanId] = position;
            }
          } catch (error) {
            console.warn(`Erro ao carregar posição P2P para ${investment.loan?.id}:`, error);
          }
        }
        setP2pPositions(positions);
      } else if (userType === 'producer') {
        const loans = await marketplaceAPIReal.getMyLoans(token);
        setMyLoans(loans);
        
        // Carregar dados do dashboard do produtor
        try {
          console.log('📊 Buscando dashboard para:', user?.email);
          const response = await fetch(`http://localhost:3001/api/dashboard/producer/${user?.email || 'producer'}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('📊 Response status:', response.status);
          if (response.ok) {
            const dashboardData = await response.json();
            console.log('📊 Dashboard data recebido:', dashboardData);
            setProducerDashboard({
              volumeTotal: dashboardData.volumeTotal || 0,
              apyMedio: dashboardData.apyMedio || 0,
              taxaSucesso: dashboardData.taxaSucesso || 0,
              totalFinanciado: dashboardData.totalFinanciado || 0
            });
          } else {
            console.error('📊 Erro na resposta:', await response.text());
          }
        } catch (error) {
          console.error('❌ Erro ao carregar dashboard do produtor:', error);
        }

        // Carregar saldo AFI do produtor
        try {
          const afiBalanceData = await afiAPI.getAFIBalance(token);
          // 1 AFI token = R$ 1.50 (baseado na proporção 15000 AFI : 10000 USDC ≈ 1.5:1)
          const AFI_TO_REAIS = 1;
          setAfiBalance({
            tokens: afiBalanceData.balance,
            valueInReais: afiBalanceData.balance * AFI_TO_REAIS
          });
        } catch (error) {
          console.error('❌ Erro ao carregar saldo AFI:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoadingPositions(false);
    }
  };

  const loadLoans = async () => {
    try {
      setLoading(true);
      setError('');
      const loansData = await marketplaceAPIReal.getAllLoans();
      setLoans(loansData);
      console.log('📋 Empréstimos carregados:', loansData.length);
    } catch (err) {
      console.error('❌ Erro ao carregar empréstimos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar empréstimos');
    } finally {
      setLoading(false);
    }
  };

  // Calcular valores P2P quando valor de investimento muda
  useEffect(() => {
    if (investmentAmount && selectedLoan) {
      const amount = parseFloat(investmentAmount);
      if (!isNaN(amount) && amount > 0) {
        const collateral = amount * 1.5; // 150% colateral
        const currentLTV = amount / collateral;
        const liquidationThreshold = 0.85;
        const healthFactor = liquidationThreshold / currentLTV;

        setEstimatedCollateral(collateral);
        setHealthFactor(healthFactor);
      }
    }
  }, [investmentAmount, selectedLoan]);

  const startP2PFlow = () => {
    setShowP2pFlow(true);
    setCurrentStep(0);
    setP2pStatus('idle');
  };

  const handleInvest = async () => {
    if (!selectedLoan || !investmentAmount || !token) {
      console.log('❌ Dados inválidos para investimento');
      return;
    }

    try {
      setInvesting(true);
      setError('');
      setP2pStatus('validating');
      setCurrentStep(1);

      const amount = parseFloat(investmentAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Valor de investimento inválido');
        setP2pStatus('error');
        return;
      }

      // Simular etapas do processo P2P
      await new Promise(resolve => setTimeout(resolve, 1000));
      setP2pStatus('creating');
      setCurrentStep(2);

      console.log('🏦 Iniciando empréstimo P2P via Morpho Blue...');

      const response = await marketplaceAPIReal.investInLoan({
        loanId: selectedLoan,
        investmentAmount: amount
      }, token);

      setTransactionHash(response.transactionHash);
      setP2pStatus('transferring');
      setCurrentStep(3);

      // Simular transferência de fundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      setP2pStatus('completed');
      setCurrentStep(4);

      console.log('✅ P2P Lending realizado:', response);

      // Atualizar a lista de empréstimos e dados do usuário
      await loadLoans();
      await loadUserData();

      // Aguardar antes de fechar o modal
      setTimeout(() => {
        setSelectedLoan(null);
        setInvestmentAmount('');
        setShowP2pFlow(false);
        setP2pStatus('idle');
        setCurrentStep(0);
      }, 3000);

    } catch (err) {
      console.error('❌ Erro no investimento P2P:', err);
      setError(err instanceof Error ? err.message : 'Erro ao realizar investimento P2P');
      setP2pStatus('error');
    } finally {
      setInvesting(false);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🐛 Debug handleCreateLoan:', { token, userType, user });
    
    if (!token || userType !== 'producer') {
      showNotification('error', 'Acesso Negado', `Apenas produtores autenticados podem criar empréstimos. Seu tipo: ${userType}`);
      return;
    }

    try {
      setLoading(true);
      await marketplaceAPIReal.createLoan(loanForm, token);
      
      showNotification('success', 'Empréstimo Criado!', 'Sua solicitação de empréstimo foi criada com sucesso e está disponível no marketplace.');
      
      // Recarregar empréstimos e limpar formulário
      await loadLoans();
      setLoanForm({
        requestedAmount: 0,
        termMonths: 6,
        maxInterestRate: 12.0,
        collateralAmount: 0,
        collateralType: 'soja',
        warehouseLocation: ''
      });
      setSelectedTab('marketplace');
    } catch (err) {
      console.error('❌ Erro ao criar empréstimo:', err);
      showNotification('error', 'Erro ao Criar Empréstimo', err instanceof Error ? err.message : 'Erro desconhecido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: 'A' | 'B' | 'C') => {
    switch(risk) {
      case 'A': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'B': return 'bg-gray-200 text-gray-700 border-gray-300';
      case 'C': return 'bg-gray-300 text-gray-600 border-gray-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'funding': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'funded': return 'bg-gray-200 text-gray-700 border-gray-300';
      case 'active': return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <UserHeader />
        
        {/* Notificação */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 max-w-md transform transition-all duration-300 ease-in-out animate-in slide-in-from-right">
            <Card className={`border-l-4 shadow-lg ${
              notification.type === 'success' ? 'border-l-gray-600 bg-gray-50' :
              notification.type === 'error' ? 'border-l-red-500 bg-red-50' :
              'border-l-gray-600 bg-gray-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-gray-600" />}
                    {notification.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                    {notification.type === 'info' && <Info className="h-5 w-5 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm ${
                      notification.type === 'success' ? 'text-gray-800' :
                      notification.type === 'error' ? 'text-red-800' :
                      'text-gray-800'
                    }`}>
                      {notification.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      notification.type === 'success' ? 'text-gray-700' :
                      notification.type === 'error' ? 'text-red-700' :
                      'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotification(null)}
                    className={`flex-shrink-0 rounded-lg p-1 hover:bg-white/50 transition-colors ${
                      notification.type === 'success' ? 'text-gray-600 hover:text-gray-800' :
                      notification.type === 'error' ? 'text-red-600 hover:text-red-800' :
                      'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="sr-only">Fechar</span>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Market Overview - Personalizado por tipo de usuário */}
        {userType === 'investor' ? (
          // Visão do Mercado para INVESTIDORES
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Target className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Oportunidades</p>
                    <p className="text-2xl font-bold text-gray-900">{marketData.totalLoanRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Wallet className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Saldo Disponível</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(INITIAL_BALANCE - myInvestments.reduce((sum, inv) => sum + (inv.investment?.amount || 0), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <TrendingUp className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">APY Médio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {!isNaN(marketData.averageAPY) ? marketData.averageAPY.toFixed(1) : '0.0'}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Shield className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Taxa de Pagamento</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {!isNaN(marketData.successRate) ? marketData.successRate.toFixed(1) : '0.0'}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Coins className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Meu Investido</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(myInvestments.reduce((sum, inv) => sum + (inv.investment?.amount || 0), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Visão do Mercado para PRODUTORES
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Sprout className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Meus Empréstimos</p>
                    <p className="text-2xl font-bold text-gray-900">{myLoans.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Coins className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Saldo Disponível (AFI)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {afiBalance ? formatCurrency(afiBalance.valueInReais) : 'R$ 0,00'}
                    </p>
                    {afiBalance && (
                      <p className="text-xs text-gray-500 mt-1">
                        {afiBalance.tokens.toLocaleString()} tokens AFI • R$ 1,00/token
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <TrendingUp className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Solicitado</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(myLoans.reduce((sum, loan) => sum + loan.requestedAmount, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Target className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Empréstimos Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {myLoans.filter(loan => loan.status === 'funding' || loan.status === 'funded').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Pagamentos Pendentes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {myLoans.reduce((sum, loan) => {
                        // Calcula número de pagamentos pendentes baseado no status e prazo
                        if (loan.status === 'funded' || loan.status === 'active') {
                          return sum + (loan.termMonths || 0);
                        }
                        return sum;
                      }, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Header */}
        

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className={`grid w-full bg-white rounded-lg shadow-sm border border-gray-200 p-1 ${
            userType === 'producer' ? 'grid-cols-5' : 'grid-cols-2'
          }`}>
            <TabsTrigger value="marketplace" className="rounded-md font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="rounded-md font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {userType === 'investor' ? 'Portfólio' : 'Meus Empréstimos'}
            </TabsTrigger>
            {userType === 'producer' && (
              <>
                <TabsTrigger value="payments" className="rounded-md font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Pagamentos
                </TabsTrigger>
                <TabsTrigger value="afi" className="rounded-md font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  AFI Tokens
                </TabsTrigger>
                <TabsTrigger value="request" className="rounded-md font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Solicitar Empréstimo
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="p-6 text-center">
                <div className="text-red-600 mb-4 flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Erro ao carregar empréstimos
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => loadLoans()} variant="outline">
                  Tentar novamente
                </Button>
              </Card>
            ) : loans.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-400 text-lg mb-2 flex items-center justify-center gap-2">
                  <Target className="h-5 w-5" />
                  Nenhum empréstimo disponível
                </div>
                <p className="text-gray-600">Não há solicitações de empréstimo abertas no momento.</p>
              </Card>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {loans.map((loan) => (
                <Card key={loan.id} className="hover:shadow-lg transition-all duration-300 border border-gray-200 shadow-sm bg-white hover:border-gray-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gray-100 text-gray-700 font-semibold border border-gray-200">
                            {loan.producer.name ? loan.producer.name.split(' ').map(n => n[0]).join('') : 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">{loan.producer.name || 'Produtor'}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-3 w-3" />
                            {loan.producer.location}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getRiskColor(loan.producer.riskScore)}>
                        Risco {loan.producer.riskScore}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Amount and Terms */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Valor Solicitado</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(loan.requestedAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">APY Projetado</p>
                        <p className="text-xl font-bold text-gray-700">
                          {loan.projectedAPY}%
                        </p>
                      </div>
                    </div>

                    {/* Producer Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-gray-500" />
                        <span>{loan.producer.reputation}/5.0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span>{loan.producer.reputation}/5 reputação</span>
                      </div>
                    </div>

                    {/* Funding Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Financiamento</span>
                        <span>{loan.fundingPercentage}%</span>
                      </div>
                      <Progress value={loan.fundingPercentage} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(loan.currentFunding)} de {formatCurrency(loan.requestedAmount)}
                      </p>
                    </div>

                    {/* Collateral Info */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Garantia</p>
                      <p className="text-xs text-gray-600">
                        {loan.collateralAmount} sacas de soja • LTV {loan.ltv}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {loan.warehouseLocation}
                      </p>
                    </div>

                    {/* Time and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{loan.termMonths} meses</span>
                      </div>
                      <Badge className={getStatusColor(loan.status)}>
                        {loan.status === 'open' ? 'Aberto' : 
                         loan.status === 'funding' ? 'Financiando' : 
                         'Financiado'}
                      </Badge>
                    </div>

                    {/* Action Button */}
                    {userType === 'investor' && (
                      <Button 
                        className="w-full" 
                        disabled={loan.status === 'funded'}
                        onClick={() => setSelectedLoan(loan.id)}
                      >
                        {loan.status === 'funded' ? 'Financiado' : 'Investir'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            )}

            {/* P2P Investment Modal */}
            {selectedLoan && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5" />
                      Empréstimo P2P via Morpho Blue
                    </CardTitle>
                    <CardDescription>
                      Criando empréstimo real na blockchain com {loans.find(l => l.id === selectedLoan)?.producer.name || 'Produtor'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    {!showP2pFlow ? (
                      // Setup inicial
                      <>
                        <div>
                          <Label htmlFor="amount">Valor do Investimento (USDC)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="10000"
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                          />
                        </div>

                        {investmentAmount && (
                          <div className="space-y-4">
                            {/* Resumo P2P */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Resumo do Empréstimo P2P
                              </h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Você Empresta (USDC)</p>
                                  <p className="font-bold text-gray-800">{formatCurrency(Number(investmentAmount))}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Produtor Oferece (AFI)</p>
                                  <p className="font-bold text-gray-700">{estimatedCollateral.toLocaleString()} tokens</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Health Factor</p>
                                  <p className={`font-bold ${healthFactor > 1.5 ? 'text-gray-800' : healthFactor > 1.2 ? 'text-gray-700' : 'text-gray-600'}`}>
                                    {healthFactor.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Seus Juros (APY)</p>
                                  <p className="font-bold text-gray-700">
                                    {loans.find(l => l.id === selectedLoan)?.projectedAPY}%
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Projeção de retorno */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Projeção de Retorno
                              </p>
                              <p className="text-xl font-bold text-gray-800">
                                {formatCurrency(Number(investmentAmount) * 1.082)}
                              </p>
                              <p className="text-xs text-gray-600">
                                em {loans.find(l => l.id === selectedLoan)?.termMonths} meses (incluindo juros)
                              </p>
                            </div>

                            {/* Explicação do processo */}
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                              <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p className="font-medium text-amber-800 mb-2">Como funciona o P2P Lending:</p>
                                  <ol className="text-amber-700 space-y-1 list-decimal list-inside">
                                    <li className="flex items-start gap-2">
                                      <span className="font-mono text-xs bg-amber-100 px-1 rounded">1</span>
                                      Sistema verifica se PRODUTOR tem AFI tokens suficientes (150% do valor)
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="font-mono text-xs bg-amber-100 px-1 rounded">2</span>
                                      Cria posição P2P real via Morpho Blue na blockchain
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="font-mono text-xs bg-amber-100 px-1 rounded">3</span>
                                      Bloqueia colateral AFI do PRODUTOR automaticamente
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="font-mono text-xs bg-amber-100 px-1 rounded">4</span>
                                      Seus USDC são transferidos para o produtor quando 100% financiado
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="font-mono text-xs bg-amber-100 px-1 rounded">5</span>
                                      Você recebe juros sobre o valor emprestado
                                    </li>
                                  </ol>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSelectedLoan(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            className="flex-1 bg-gray-800 hover:bg-gray-900"
                            disabled={!investmentAmount || Number(investmentAmount) <= 0}
                            onClick={startP2PFlow}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Iniciar P2P Lending
                          </Button>
                        </div>
                      </>
                    ) : (
                      // Fluxo P2P em andamento
                      <>
                        {/* Progress Steps */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Progresso do P2P Lending</span>
                            <span className="text-gray-500">{currentStep}/4</span>
                          </div>

                          <div className="space-y-3">
                            {/* Step 1: Validação */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                              currentStep >= 1 ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'
                            }`}>
                              {p2pStatus === 'validating' && currentStep === 1 ? (
                                <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                              ) : currentStep > 1 ? (
                                <CheckCircle className="h-5 w-5 text-gray-700" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                              )}
                              <div>
                                <p className="font-medium text-gray-800">1. Validando Colateral do Produtor</p>
                                <p className="text-sm text-gray-600">Verificando se produtor tem {estimatedCollateral.toLocaleString()} AFI tokens como colateral</p>
                              </div>
                            </div>

                            {/* Step 2: Criação P2P */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                              currentStep >= 2 ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'
                            }`}>
                              {p2pStatus === 'creating' && currentStep === 2 ? (
                                <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                              ) : currentStep > 2 ? (
                                <CheckCircle className="h-5 w-5 text-gray-700" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                              )}
                              <div>
                                <p className="font-medium text-gray-800">2. Criando Posição P2P Morpho</p>
                                <p className="text-sm text-gray-600">Executando transação na blockchain Sepolia</p>
                              </div>
                            </div>

                            {/* Step 3: Transferência */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                              currentStep >= 3 ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'
                            }`}>
                              {p2pStatus === 'transferring' && currentStep === 3 ? (
                                <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                              ) : currentStep > 3 ? (
                                <CheckCircle className="h-5 w-5 text-gray-700" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                              )}
                              <div>
                                <p className="font-medium text-gray-800">3. Bloqueando Colateral do Produtor</p>
                                <p className="text-sm text-gray-600">AFI tokens do produtor sendo bloqueados automaticamente</p>
                              </div>
                            </div>

                            {/* Step 4: Conclusão */}
                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                              currentStep >= 4 ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'
                            }`}>
                              {p2pStatus === 'completed' && currentStep === 4 ? (
                                <CheckCircle className="h-5 w-5 text-gray-700" />
                              ) : currentStep === 4 ? (
                                <CheckCircle className="h-5 w-5 text-gray-700" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                              )}
                              <div>
                                <p className="font-medium text-gray-800">4. P2P Lending Ativo</p>
                                <p className="text-sm text-gray-600">Empréstimo criado na blockchain com sucesso!</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Transaction Hash */}
                        {transactionHash && (
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <p className="font-medium text-gray-800 mb-2">🔗 Transaction Hash:</p>
                            <div className="flex items-center gap-2">
                              <code className="bg-white px-2 py-1 rounded text-xs font-mono flex-1 truncate">
                                {transactionHash}
                              </code>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transactionHash}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Error Display */}
                        {p2pStatus === 'error' && error && (
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 text-red-800">
                              <AlertTriangle className="h-5 w-5" />
                              <p className="font-medium">Erro no P2P Lending</p>
                            </div>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                          </div>
                        )}

                        {/* Success Message */}
                        {p2pStatus === 'completed' && (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 text-gray-800">
                              <CheckCircle className="h-5 w-5" />
                              <p className="font-medium">P2P Lending Realizado com Sucesso!</p>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              Empréstimo de {formatCurrency(Number(investmentAmount))} criado via Morpho Blue.
                              O colateral AFI foi bloqueado e o USDC será transferido para o produtor.
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {p2pStatus === 'error' ? (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setShowP2pFlow(false);
                                  setP2pStatus('idle');
                                  setCurrentStep(0);
                                  setError('');
                                }}
                              >
                                Voltar
                              </Button>
                              <Button
                                className="flex-1"
                                onClick={handleInvest}
                                disabled={investing}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Tentar Novamente
                              </Button>
                            </>
                          ) : p2pStatus === 'completed' ? (
                            <Button
                              className="w-full bg-gray-800 hover:bg-gray-900"
                              onClick={() => {
                                setSelectedLoan(null);
                                setInvestmentAmount('');
                                setShowP2pFlow(false);
                                setP2pStatus('idle');
                                setCurrentStep(0);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Concluído
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setSelectedLoan(null)}
                                disabled={investing}
                              >
                                Cancelar
                              </Button>
                              <Button
                                className="flex-1 bg-gray-800 hover:bg-gray-900"
                                disabled={investing || p2pStatus !== 'idle'}
                                onClick={handleInvest}
                              >
                                {investing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processando P2P...
                                  </>
                                ) : (
                                  <>
                                    <Coins className="h-4 w-4 mr-2" />
                                    Confirmar P2P Lending
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            {userType === 'producer' ? (
              // Dashboard do Produtor
              <div className="space-y-6">
                {/* Cards de Métricas do Produtor */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <DollarSign className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Volume Total</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {producerDashboard && !isNaN(producerDashboard.volumeTotal) 
                              ? formatCurrency(producerDashboard.volumeTotal) 
                              : 'R$ 0,00'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <TrendingUp className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">APY Médio</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {producerDashboard && !isNaN(producerDashboard.apyMedio)
                              ? `${producerDashboard.apyMedio.toFixed(1)}%` 
                              : '0.0%'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Shield className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Taxa de Financiamento</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {myLoans.length > 0 
                              ? `${((myLoans.filter(loan => loan.status === 'funded' || loan.status === 'completed').length / myLoans.length) * 100).toFixed(1)}%`
                              : '0.0%'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Users className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Financiado</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {producerDashboard && !isNaN(producerDashboard.totalFinanciado)
                              ? formatCurrency(producerDashboard.totalFinanciado) 
                              : 'R$ 0,00'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Meus Empréstimos Ativos */}
                {myLoans.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Meus Empréstimos Ativos</CardTitle>
                      <CardDescription>Financiamentos recebidos e status de pagamento</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {myLoans.map((loan) => (
                          <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-lg">{formatCurrency(loan.requestedAmount)}</p>
                              <p className="text-sm text-gray-600">
                                Taxa: {loan.maxInterestRate}% | Prazo: {loan.termMonths} meses
                              </p>
                              <p className="text-xs text-gray-500">
                                Solicitado em {new Date(loan.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(loan.status)}>
                                {loan.status === 'open' ? 'Aberto' :
                                 loan.status === 'funding' ? 'Em Financiamento' :
                                 loan.status === 'funded' ? 'Financiado' :
                                 loan.status === 'active' ? 'Ativo' :
                                 loan.status === 'completed' ? 'Quitado' : loan.status}
                              </Badge>
                              <div className="mt-2">
                                <Progress 
                                  value={loan.fundingPercentage} 
                                  className="w-32"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                  {formatCurrency(loan.currentFunding)} / {formatCurrency(loan.requestedAmount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              // Dashboard do Investidor (código original)
            <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Minha Carteira
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Saldo Total</p>
                      <p className="text-3xl font-bold">
                        {formatCurrency(INITIAL_BALANCE)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Investido P2P</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(myInvestments.reduce((sum, inv) => sum + (inv.investment?.amount || 0), 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Disponível</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(INITIAL_BALANCE - myInvestments.reduce((sum, inv) => sum + (inv.investment?.amount || 0), 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance P2P
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">APY Médio</p>
                      <p className="text-3xl font-bold text-green-600">
                        {myInvestments.length > 0 ? '8.4%' : '0%'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Posições P2P Ativas</p>
                        <p className="text-lg font-semibold">{myInvestments.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Health Factor Médio</p>
                        <p className="text-lg font-semibold text-green-600">
                          {Object.values(p2pPositions).length > 0
                            ? (Object.values(p2pPositions).reduce((sum, pos) => sum + parseFloat(pos.healthFactor), 0) / Object.values(p2pPositions).length).toFixed(2)
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Investments */}
            {myInvestments.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Investimentos Recentes</CardTitle>
                  <CardDescription>Últimos investimentos P2P realizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myInvestments.slice(0, 5).map((inv) => (
                      <div key={inv.loan?.id || `inv-${inv.investment.investedAt}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{inv.loan?.producer?.name || 'Produtor'}</p>
                          <p className="text-sm text-gray-600">Investimento: {formatCurrency(inv.investment.amount)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(inv.investment.investedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(inv.loan?.status || 'open')}>
                            {inv.loan?.status === 'funded' ? 'Financiado' :
                             inv.loan?.status === 'funding' ? 'Em Financiamento' :
                             inv.loan?.status === 'completed' ? 'Concluído' : inv.loan?.status || 'Aberto'}
                          </Badge>
                          {inv.transactionHash && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="mt-1 h-6 px-2 text-xs"
                              onClick={() => window.open(`https://sepolia.etherscan.io/tx/${inv.transactionHash}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Tx
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
            )}
          </TabsContent>

          {/* Payments Tab - Only for Producers */}
          {userType === 'producer' && (
            <TabsContent value="payments" className="mt-6">
              <ProducerPayments producerName={user?.email || 'producer'} />
            </TabsContent>
          )}

          {/* P2P Positions Tab */}
          <TabsContent value="p2p" className="mt-6">
            <div className="space-y-6">
              {/* P2P Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Coins className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Total Emprestado</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(myInvestments.reduce((sum, inv) => sum + (inv.investment?.amount || 0), 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Posições Ativas</p>
                        <p className="text-2xl font-bold text-gray-900">{Object.keys(p2pPositions).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Juros Acumulados</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(Object.values(p2pPositions).reduce((sum, pos) => sum + parseFloat(pos.interestAccrued || '0'), 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active P2P Positions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Posições P2P Ativas via Morpho Blue
                    {loadingPositions && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  <CardDescription>
                    Empréstimos P2P em tempo real na blockchain Ethereum Sepolia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(p2pPositions).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-lg mb-2 flex items-center justify-center gap-2">
                        <Coins className="h-5 w-5" />
                        Nenhuma posição P2P ativa
                      </div>
                      <p className="text-gray-600">Você não possui empréstimos P2P ativos no momento.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(p2pPositions).map(([loanId, position]) => {
                        const investment = myInvestments.find(inv => inv.loanId === loanId);
                        const loan = loans.find(l => l.id === loanId);

                        return (
                          <div key={loanId} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {loan?.producer.name || investment?.producerName || 'Produtor'}
                                </h3>
                                <p className="text-sm text-gray-600">Loan ID: {loanId}</p>
                                {position.transactionHash && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="mt-1 h-6 px-2 text-xs"
                                    onClick={() => window.open(`https://sepolia.etherscan.io/tx/${position.transactionHash}`, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Ver na Blockchain
                                  </Button>
                                )}
                              </div>
                              <Badge className={position.status === 'ACTIVE' ? 'bg-gray-100 text-gray-800' :
                                               position.status === 'LIQUIDATED' ? 'bg-gray-200 text-gray-700' :
                                               'bg-gray-100 text-gray-800'}>
                                {position.status === 'ACTIVE' ? 'Ativo' :
                                 position.status === 'LIQUIDATED' ? 'Liquidado' :
                                 'Pago'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Principal Emprestado</p>
                                <p className="font-bold text-gray-800">
                                  {formatCurrency(parseFloat(position.principal))}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Colateral AFI</p>
                                <p className="font-bold text-gray-700">
                                  {parseFloat(position.collateral).toLocaleString()} tokens
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Health Factor</p>
                                <p className={`font-bold ${
                                  parseFloat(position.healthFactor) > 1.5 ? 'text-gray-800' :
                                  parseFloat(position.healthFactor) > 1.2 ? 'text-gray-700' :
                                  'text-gray-600'
                                }`}>
                                  {parseFloat(position.healthFactor).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Juros Acumulados</p>
                                <p className="font-bold text-gray-700">
                                  {formatCurrency(parseFloat(position.interestAccrued || '0'))}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Vencimento: {new Date(position.maturityDate).toLocaleDateString('pt-BR')}</span>
                                <span className="flex items-center gap-1">
                                  {parseFloat(position.healthFactor) < 1.2 ? (
                                    <>
                                      <AlertTriangle className="h-3 w-3" />
                                      Próximo da liquidação
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3 w-3" />
                                      Saudável
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AFI Tokens Tab - Only for Producers */}
          {userType === 'producer' && (
            <TabsContent value="afi" className="mt-6">
              <AFITokenRequest />
            </TabsContent>
          )}

          {/* Request Loan Tab - Only for Producers */}
          {userType === 'producer' && (
            <TabsContent value="request" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Empréstimo</CardTitle>
                  <CardDescription>
                    Preencha os dados para solicitar um empréstimo usando sua produção como garantia
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleCreateLoan}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="requested-amount">Valor Solicitado (BRL)</Label>
                      <Input 
                        id="requested-amount" 
                        type="number" 
                        placeholder="150000"
                        value={loanForm.requestedAmount || ''}
                        onChange={(e) => setLoanForm({...loanForm, requestedAmount: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="term">Prazo (meses)</Label>
                      <Input 
                        id="term" 
                        type="number" 
                        placeholder="6"
                        value={loanForm.termMonths}
                        onChange={(e) => setLoanForm({...loanForm, termMonths: parseInt(e.target.value) || 6})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="collateral">Quantidade de Soja (sacas)</Label>
                      <Input 
                        id="collateral" 
                        type="number" 
                        placeholder="500"
                        value={loanForm.collateralAmount || ''}
                        onChange={(e) => setLoanForm({...loanForm, collateralAmount: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="interest">Taxa Máxima (% ao ano)</Label>
                      <Input 
                        id="interest" 
                        type="number" 
                        step="0.1"
                        placeholder="12.0"
                        value={loanForm.maxInterestRate}
                        onChange={(e) => setLoanForm({...loanForm, maxInterestRate: parseFloat(e.target.value) || 12.0})}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Enviar Solicitação
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          )}
        </Tabs>

      </div>
    </div>
  );
}