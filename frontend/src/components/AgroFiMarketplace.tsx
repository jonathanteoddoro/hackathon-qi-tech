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
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceAPIReal, type LoanRequest, type CreateLoanRequest } from '../services/marketplace-real-api';
import UserHeader from './UserHeader';

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

    const totalRequested = loans.reduce((sum: number, loan: any) => sum + loan.amount, 0);
    const totalFunded = loans.reduce((sum: number, loan: any) => sum + loan.currentAmount, 0);
    const averageAPY = loans.reduce((sum: number, loan: any) => sum + loan.interestRate, 0) / loans.length;
    const fundedLoans = loans.filter((loan: any) => loan.currentAmount >= loan.amount).length;
    const successRate = (fundedLoans / loans.length) * 100;

    return {
      totalValue: totalRequested,
      averageAPY,
      successRate,
      totalFunded,
      totalLoanRequests: loans.length,
      totalVolume: totalRequested
    };
  }, [loans]);
  
  // Estados para criação de empréstimo
  const [loanForm, setLoanForm] = useState<CreateLoanRequest>({
    requestedAmount: 0,
    termMonths: 6,
    maxInterestRate: 8.5,
    collateralAmount: 0,
    collateralType: 'soja',
    warehouseLocation: '',
    warehouseCertificate: ''
  });
  
  // Usar o tipo de usuário da autenticação se disponível, senão padrão para investidor
  const userType = user?.userType || 'investor';

  // Carregar empréstimos ao montar o componente
  useEffect(() => {
    loadLoans();
  }, []);

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

    const handleInvest = async () => {
    if (!selectedLoan || !investmentAmount || !token) {
      console.log('❌ Dados inválidos para investimento');
      return;
    }

    try {
      setInvesting(true);
      setError('');
      
      const amount = parseFloat(investmentAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Valor de investimento inválido');
        return;
      }

      console.log('💰 Enviando investimento:', { loanId: selectedLoan, amount });
      
      const response = await marketplaceAPIReal.investInLoan({
        loanId: selectedLoan,
        investmentAmount: amount
      }, token);
      
      console.log('✅ Investimento realizado:', response);
      
      // Atualizar a lista de empréstimos
      await loadLoans();
      
      // Limpar o modal
      setSelectedLoan(null);
      setInvestmentAmount('');
      
      // Mostrar sucesso (você pode adicionar um toast aqui)
      alert(`Investimento de R$ ${amount.toLocaleString()} realizado com sucesso!`);
      
    } catch (err) {
      console.error('❌ Erro no investimento:', err);
      setError(err instanceof Error ? err.message : 'Erro ao realizar investimento');
    } finally {
      setInvesting(false);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || userType !== 'producer') {
      alert('Apenas produtores autenticados podem criar empréstimos');
      return;
    }

    try {
      setLoading(true);
      await marketplaceAPIReal.createLoan(loanForm, token);
      
      alert('✅ Solicitação de empréstimo criada com sucesso!');
      
      // Recarregar empréstimos e limpar formulário
      await loadLoans();
      setLoanForm({
        requestedAmount: 0,
        termMonths: 6,
        maxInterestRate: 8.5,
        collateralAmount: 0,
        collateralType: 'soja',
        warehouseLocation: '',
        warehouseCertificate: ''
      });
      setSelectedTab('marketplace');
    } catch (err) {
      console.error('❌ Erro ao criar empréstimo:', err);
      alert(`Erro ao criar empréstimo: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: 'A' | 'B' | 'C') => {
    switch(risk) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'funding': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'funded': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-purple-100 text-purple-800 border-purple-200';
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Sprout className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">AgroFi</h1>
          </div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
            Marketplace P2P para empréstimos agrícolas descentralizados
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Conectando produtores rurais diretamente a investidores
          </p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Solicitações</p>
                  <p className="text-2xl font-bold text-gray-900">{marketData.totalLoanRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Volume Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(marketData.totalVolume)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">APY Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{marketData.averageAPY.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-gray-900">{marketData.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Financiado</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(marketData.totalFunded)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Header */}
        <UserHeader />

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className={`grid w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 p-1 ${
            userType === 'producer' ? 'grid-cols-3' : 'grid-cols-2'
          }`}>
            <TabsTrigger value="marketplace" className="rounded-lg font-medium">
              🏪 Marketplace
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="rounded-lg font-medium">
              📊 {userType === 'investor' ? 'Portfólio' : 'Meus Empréstimos'}
            </TabsTrigger>
            {userType === 'producer' && (
              <TabsTrigger value="request" className="rounded-lg font-medium">
                ➕ Solicitar Empréstimo
              </TabsTrigger>
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
                <div className="text-red-600 mb-4">❌ Erro ao carregar empréstimos</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => loadLoans()} variant="outline">
                  Tentar novamente
                </Button>
              </Card>
            ) : loans.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-400 text-lg mb-2">📋 Nenhum empréstimo disponível</div>
                <p className="text-gray-600">Não há solicitações de empréstimo abertas no momento.</p>
              </Card>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {loans.map((loan) => (
                <Card key={loan.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm hover:bg-white">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 font-semibold">
                            {loan.producer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">{loan.producer.name}</CardTitle>
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
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(loan.requestedAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">APY Projetado</p>
                        <p className="text-xl font-bold text-blue-600">
                          {loan.projectedAPY}%
                        </p>
                      </div>
                    </div>

                    {/* Producer Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{loan.producer.reputation}/5.0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-green-500" />
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

            {/* Investment Modal */}
            {selectedLoan && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Realizar Investimento</CardTitle>
                    <CardDescription>
                      Investir em {loans.find(l => l.id === selectedLoan)?.producer.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Valor do Investimento</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="R$ 0,00"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                      />
                    </div>
                    
                    {investmentAmount && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Projeção de Retorno</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(Number(investmentAmount) * 1.082)}
                        </p>
                        <p className="text-xs text-blue-600">
                          em {loans.find(l => l.id === selectedLoan)?.termMonths} meses
                        </p>
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
                        className="flex-1"
                        disabled={!investmentAmount || investing}
                        onClick={handleInvest}
                      >
                        {investing ? '💫 Investindo...' : 'Confirmar Investimento'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
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
                      <p className="text-3xl font-bold">R$ 45.280,00</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Investido</p>
                        <p className="text-lg font-semibold text-blue-600">R$ 32.500,00</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Disponível</p>
                        <p className="text-lg font-semibold text-green-600">R$ 12.780,00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Retorno Total</p>
                      <p className="text-3xl font-bold text-green-600">+8.4%</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Investimentos Ativos</p>
                        <p className="text-lg font-semibold">7</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                        <p className="text-lg font-semibold text-green-600">100%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                      <Label htmlFor="warehouse">Armazém</Label>
                      <Input 
                        id="warehouse" 
                        placeholder="Armazém Cargill - Sorriso"
                        value={loanForm.warehouseLocation}
                        onChange={(e) => setLoanForm({...loanForm, warehouseLocation: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="certificate">Certificado de Depósito</Label>
                      <Input 
                        id="certificate" 
                        placeholder="CDA-001234"
                        value={loanForm.warehouseCertificate}
                        onChange={(e) => setLoanForm({...loanForm, warehouseCertificate: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="interest">Taxa Máxima (% ao ano)</Label>
                      <Input 
                        id="interest" 
                        type="number" 
                        step="0.1"
                        placeholder="8.5"
                        value={loanForm.maxInterestRate}
                        onChange={(e) => setLoanForm({...loanForm, maxInterestRate: parseFloat(e.target.value) || 8.5})}
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Documentos Necessários</p>
                        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                          <li>• CPF e RG</li>
                          <li>• Comprovante de propriedade rural</li>
                          <li>• Certificado de Depósito Agrícola (CDA)</li>
                          <li>• Histórico de produção</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '📤 Enviando...' : 'Enviar Solicitação'}
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