import React, { useState, useEffect } from 'react';
import { walletApi, morphoOnChainApi, morphoApi, type WalletInfo, type BalanceInfo, type LoanSimulation, type SojaLoanComplete, type MorphoMarket } from '../services/api';
import '../simple.css';

const SimpleDashboard: React.FC = () => {
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
        setMarkets(marketData.slice(0, 5));
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
    <div className="container">
      
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <span style={{fontSize: '2rem'}}>🌱</span>
          <h1>AgroFi DeFi</h1>
          <span style={{fontSize: '2rem'}}>🍃</span>
        </div>
        <p>
          Plataforma de empréstimos agrícolas descentralizados com integração Morpho Blue
        </p>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span style={{fontSize: '2rem', color: '#22c55e'}}>💰</span>
          <div>
            <div className="stat-label">TVL Total</div>
            <div className="stat-number">$2.1B</div>
          </div>
        </div>
        
        <div className="stat-card">
          <span style={{fontSize: '2rem', color: '#3b82f6'}}>📈</span>
          <div>
            <div className="stat-label">APY Médio</div>
            <div className="stat-number">5.2%</div>
          </div>
        </div>
        
        <div className="stat-card">
          <span style={{fontSize: '2rem', color: '#8b5cf6'}}>🛡️</span>
          <div>
            <div className="stat-label">Rede</div>
            <div className="stat-number text-small">Base Sepolia</div>
          </div>
        </div>
        
        <div className="stat-card">
          <span style={{fontSize: '2rem', color: '#f59e0b'}}>🪙</span>
          <div>
            <div className="stat-label">Mercados</div>
            <div className="stat-number">{markets.length}</div>
          </div>
        </div>
      </div>

      <div className="main-grid">
        
        {/* Seção de Carteira */}
        <div className="card">
          <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <span>💳</span>
            Carteira Blockchain
          </h2>
          
          {!currentWallet ? (
            <div className="text-center">
              <p style={{marginBottom: '1rem', color: '#6b7280'}}>Conecte-se à blockchain para começar</p>
              <button 
                onClick={handleGenerateWallet}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Gerando...' : 'Gerar Nova Carteira'}
              </button>
            </div>
          ) : (
            <div>
              <div className="wallet-address">
                <strong>Endereço:</strong><br/>
                {currentWallet.address}
              </div>
              
              {walletBalance && (
                <div className="balance-grid">
                  <div className="balance-card eth">
                    <div className="text-small">ETH</div>
                    <div className="balance-amount">{walletBalance.ethBalance}</div>
                  </div>
                  <div className="balance-card usdc">
                    <div className="text-small">USDC</div>
                    <div className="balance-amount">{walletBalance.usdcBalance}</div>
                  </div>
                </div>
              )}
              
              <div style={{borderTop: '1px solid #e5e7eb', paddingTop: '1rem'}}>
                <p className="text-small text-gray">
                  <strong>Rede:</strong> {walletBalance?.network || 'Base Sepolia'}
                </p>
                <p className="text-small text-gray">
                  <strong>Chain ID:</strong> {currentWallet.chainId}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Seção de Empréstimo */}
        <div className="card">
          <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <span>🧮</span>
            Simular Empréstimo de Soja
          </h2>
          
          <div>
            <div className="form-group">
              <label className="form-label">
                Quantidade de Soja (toneladas)
              </label>
              <input
                type="number"
                value={sojaAmount}
                onChange={(e) => setSojaAmount(Number(e.target.value))}
                className="form-input"
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Preço por Tonelada (USD)
              </label>
              <input
                type="number"
                value={sojaPrice}
                onChange={(e) => setSojaPrice(Number(e.target.value))}
                className="form-input"
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                LTV Ratio ({(ltvRatio * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                value={ltvRatio}
                onChange={(e) => setLtvRatio(Number(e.target.value))}
                className="range-input"
                min="0.5"
                max="0.8"
                step="0.05"
              />
            </div>
            
            <div className="bg-info">
              <p className="text-small">
                <strong>Valor do Colateral:</strong> ${(sojaAmount * sojaPrice).toLocaleString()}
              </p>
              <p className="text-small">
                <strong>Empréstimo Máximo:</strong> ${(sojaAmount * sojaPrice * ltvRatio).toLocaleString()}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleSimulateLoan}
                disabled={loading || !currentWallet}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Simulando...' : 'Simular'}
              </button>
              
              <button 
                onClick={handleCreateSojaLoan}
                disabled={loading || !currentWallet}
                className="btn btn-secondary flex-1"
              >
                {loading ? 'Criando...' : 'Criar Empréstimo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados da Simulação */}
      {simulation && (
        <div className="card">
          <h3 style={{marginBottom: '1rem'}}>📊 Resultado da Simulação</h3>
          <div className="results-grid">
            <div className="result-card green">
              <div className="result-label">Empréstimo Recomendado</div>
              <div className="result-value">${simulation.recommendedBorrowAmount}</div>
            </div>
            
            <div className="result-card blue">
              <div className="result-label">APY Estimado</div>
              <div className="result-value">{simulation.estimatedApy}%</div>
            </div>
            
            <div className="result-card purple">
              <div className="result-label">Health Factor</div>
              <div className="result-value">{simulation.healthFactor}</div>
            </div>
            
            <div className="result-card yellow">
              <div className="result-label">Juros Mensais</div>
              <div className="result-value">${simulation.monthlyInterest}</div>
            </div>
            
            <div className="result-card red">
              <div className="result-label">Preço de Liquidação</div>
              <div className="result-value">${simulation.liquidationPrice}</div>
            </div>
            
            <div className="result-card gray">
              <div className="result-label">Empréstimo Máximo</div>
              <div className="result-value">${simulation.maxBorrowAmount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Resultado do Empréstimo de Soja */}
      {sojaLoanResult && (
        <div className="card">
          <h3 style={{marginBottom: '1rem'}}>🌾 Empréstimo de Soja Criado</h3>
          
          <div className="main-grid mb-4">
            <div className="result-card green">
              <h4>Parâmetros do Empréstimo</h4>
              <div style={{marginTop: '0.75rem'}}>
                <p className="text-small"><strong>Colateral:</strong> ${sojaLoanResult.loanParams.collateralAmount}</p>
                <p className="text-small"><strong>Empréstimo:</strong> ${sojaLoanResult.loanParams.borrowAmount}</p>
                <p className="text-small"><strong>Carteira:</strong> {sojaLoanResult.loanParams.userAddress.slice(0, 10)}...</p>
                <p className="text-small"><strong>Market ID:</strong> {sojaLoanResult.loanParams.marketId}</p>
              </div>
            </div>
            
            <div className="result-card blue">
              <h4>Informações da Carteira</h4>
              <div style={{marginTop: '0.75rem'}}>
                <p className="text-small"><strong>ETH:</strong> {sojaLoanResult.walletInfo.ethBalance}</p>
                <p className="text-small"><strong>USDC:</strong> {sojaLoanResult.walletInfo.usdcBalance}</p>
                <p className="text-small"><strong>Rede:</strong> {sojaLoanResult.walletInfo.network}</p>
              </div>
            </div>
          </div>
          
          <div className="result-card yellow">
            <h4>📋 Próximos Passos</h4>
            <ol style={{marginTop: '0.75rem', paddingLeft: '1.25rem'}}>
              {sojaLoanResult.nextSteps.map((step, index) => (
                <li key={index} className="text-small">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Mercados Morpho */}
      {markets.length > 0 && (
        <div className="card">
          <h3 style={{marginBottom: '1rem'}}>🏦 Mercados Morpho Blue</h3>
          <div style={{overflowX: 'auto'}}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ativo</th>
                  <th>Colateral</th>
                  <th>Borrow APY</th>
                  <th>Supply APY</th>
                  <th>Utilização</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market, index) => (
                  <tr key={index}>
                    <td style={{fontWeight: '600'}}>{market.loanAsset.symbol}</td>
                    <td>{market.collateralAsset.symbol}</td>
                    <td className="text-red">{market.state.borrowApy.toFixed(2)}%</td>
                    <td className="text-green">{market.state.supplyApy.toFixed(2)}%</td>
                    <td>{(market.state.utilization * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default SimpleDashboard;