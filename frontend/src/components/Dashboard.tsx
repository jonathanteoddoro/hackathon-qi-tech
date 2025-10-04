import React, { useState, useEffect } from 'react';
import { Wallet, Sprout, TrendingUp, DollarSign, Leaf, Calculator, Shield, Coins } from 'lucide-react';
import { walletApi, morphoOnChainApi, morphoApi, type WalletInfo, type BalanceInfo, type LoanSimulation, type SojaLoanComplete, type MorphoMarket } from '../services/api';

const Dashboard: React.FC = () => {
  // Estados
  const [currentWallet, setCurrentWallet] = useState<WalletInfo | null>(null);
  const [walletBalance, setWalletBalance] = useState<BalanceInfo | null>(null);
  const [simulation, setSimulation] = useState<LoanSimulation | null>(null);
  const [sojaLoanResult, setSojaLoanResult] = useState<SojaLoanComplete | null>(null);
  const [markets, setMarkets] = useState<MorphoMarket[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Formulários
  const [sojaAmount, setSojaAmount] = useState<number>(100);
  const [sojaPrice, setSojaPrice] = useState<number>(500);
  const [ltvRatio, setLtvRatio] = useState<number>(0.7);

  // Carregar mercados Morpho
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const marketData = await morphoApi.getMarkets();
        setMarkets(marketData.slice(0, 5)); // Primeiros 5 mercados
      } catch (error) {
        console.error('Erro ao carregar mercados:', error);
      }
    };
    loadMarkets();
  }, []);

  // 🔐 Gerar nova carteira
  const handleGenerateWallet = async () => {
    setLoading(true);
    try {
      const wallet = await walletApi.generate();
      setCurrentWallet(wallet);
      
      // Buscar saldo automaticamente
      const balance = await walletApi.getBalance(wallet.address);
      setWalletBalance(balance);
      
      console.log('✅ Carteira criada:', wallet.address);
    } catch (error) {
      console.error('❌ Erro ao gerar carteira:', error);
    } finally {
      setLoading(false);
    }
  };

  // 💰 Simular empréstimo
  const handleSimulateLoan = async () => {
    if (!currentWallet) {
      alert('Primeiro gere uma carteira!');
      return;
    }

    setLoading(true);
    try {
      const collateralValue = sojaAmount * sojaPrice;
      const simulationResult = await morphoOnChainApi.simulateLoan(collateralValue.toString(), ltvRatio);
      setSimulation(simulationResult);
      
      console.log('📊 Simulação concluída:', simulationResult);
    } catch (error) {
      console.error('❌ Erro na simulação:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🌾 Criar empréstimo completo de soja
  const handleCreateSojaLoan = async () => {
    if (!currentWallet?.privateKey) {
      alert('Primeiro gere uma carteira!');
      return;
    }

    setLoading(true);
    try {
      const result = await morphoOnChainApi.createSojaLoanComplete(
        currentWallet.privateKey,
        sojaAmount,
        sojaPrice,
        ltvRatio
      );
      setSojaLoanResult(result);
      
      console.log('🌾 Empréstimo de soja criado:', result);
    } catch (error) {
      console.error('❌ Erro ao criar empréstimo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sprout className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">AgroFi DeFi</h1>
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma de empréstimos agrícolas descentralizados com integração Morpho Blue
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-600">TVL Total</h3>
                <p className="text-2xl font-bold text-gray-800">$2.1B</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-600">APY Médio</h3>
                <p className="text-2xl font-bold text-gray-800">5.2%</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-600">Rede</h3>
                <p className="text-lg font-bold text-gray-800">Base Sepolia</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-600">Mercados</h3>
                <p className="text-2xl font-bold text-gray-800">{markets.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Seção de Carteira */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Wallet className="h-6 w-6" />
              Carteira Blockchain
            </h2>
            
            {!currentWallet ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Conecte-se à blockchain para começar</p>
                <button 
                  onClick={handleGenerateWallet}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Gerando...' : 'Gerar Nova Carteira'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Endereço</h3>
                  <p className="font-mono text-sm break-all text-gray-800">{currentWallet.address}</p>
                </div>
                
                {walletBalance && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600 mb-1">ETH</h3>
                      <p className="text-lg font-bold text-blue-800">{walletBalance.ethBalance}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-green-600 mb-1">USDC</h3>
                      <p className="text-lg font-bold text-green-800">{walletBalance.usdcBalance}</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Rede:</strong> {walletBalance?.network || 'Base Sepolia'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Chain ID:</strong> {currentWallet.chainId}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Seção de Empréstimo */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Calculator className="h-6 w-6" />
              Simular Empréstimo de Soja
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade de Soja (toneladas)
                </label>
                <input
                  type="number"
                  value={sojaAmount}
                  onChange={(e) => setSojaAmount(Number(e.target.value))}
                  className="input-field"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço por Tonelada (USD)
                </label>
                <input
                  type="number"
                  value={sojaPrice}
                  onChange={(e) => setSojaPrice(Number(e.target.value))}
                  className="input-field"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LTV Ratio ({(ltvRatio * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  value={ltvRatio}
                  onChange={(e) => setLtvRatio(Number(e.target.value))}
                  className="w-full"
                  min="0.5"
                  max="0.8"
                  step="0.05"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Valor do Colateral:</strong> ${(sojaAmount * sojaPrice).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Empréstimo Máximo:</strong> ${(sojaAmount * sojaPrice * ltvRatio).toLocaleString()}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleSimulateLoan}
                  disabled={loading || !currentWallet}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Simulando...' : 'Simular'}
                </button>
                
                <button 
                  onClick={handleCreateSojaLoan}
                  disabled={loading || !currentWallet}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Criando...' : 'Criar Empréstimo'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados da Simulação */}
        {simulation && (
          <div className="card p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Resultado da Simulação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-600 mb-2">Empréstimo Recomendado</h4>
                <p className="text-2xl font-bold text-green-800">${simulation.recommendedBorrowAmount}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-600 mb-2">APY Estimado</h4>
                <p className="text-2xl font-bold text-blue-800">{simulation.estimatedApy}%</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-600 mb-2">Health Factor</h4>
                <p className="text-2xl font-bold text-purple-800">{simulation.healthFactor}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-600 mb-2">Juros Mensais</h4>
                <p className="text-xl font-bold text-yellow-800">${simulation.monthlyInterest}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-red-600 mb-2">Preço de Liquidação</h4>
                <p className="text-xl font-bold text-red-800">${simulation.liquidationPrice}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Empréstimo Máximo</h4>
                <p className="text-xl font-bold text-gray-800">${simulation.maxBorrowAmount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultado do Empréstimo de Soja */}
        {sojaLoanResult && (
          <div className="card p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🌾 Empréstimo de Soja Criado</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-700 mb-3">Parâmetros do Empréstimo</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Colateral:</strong> ${sojaLoanResult.loanParams.collateralAmount}</p>
                  <p><strong>Empréstimo:</strong> ${sojaLoanResult.loanParams.borrowAmount}</p>
                  <p><strong>Carteira:</strong> {sojaLoanResult.loanParams.userAddress.slice(0, 10)}...</p>
                  <p><strong>Market ID:</strong> {sojaLoanResult.loanParams.marketId}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-3">Informações da Carteira</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>ETH:</strong> {sojaLoanResult.walletInfo.ethBalance}</p>
                  <p><strong>USDC:</strong> {sojaLoanResult.walletInfo.usdcBalance}</p>
                  <p><strong>Rede:</strong> {sojaLoanResult.walletInfo.network}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-700 mb-3">📋 Próximos Passos</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {sojaLoanResult.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Mercados Morpho */}
        {markets.length > 0 && (
          <div className="card p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏦 Mercados Morpho Blue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Ativo</th>
                    <th className="text-left py-2">Colateral</th>
                    <th className="text-left py-2">Borrow APY</th>
                    <th className="text-left py-2">Supply APY</th>
                    <th className="text-left py-2">Utilização</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map((market, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{market.loanAsset.symbol}</td>
                      <td className="py-2">{market.collateralAsset.symbol}</td>
                      <td className="py-2 text-red-600">{market.state.borrowApy.toFixed(2)}%</td>
                      <td className="py-2 text-green-600">{market.state.supplyApy.toFixed(2)}%</td>
                      <td className="py-2">{(market.state.utilization * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;