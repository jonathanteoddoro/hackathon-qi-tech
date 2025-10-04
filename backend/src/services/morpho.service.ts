import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

export interface MorphoMarket {
  uniqueKey: string;
  lltv: string;
  oracleAddress: string;
  irmAddress: string;
  loanAsset: {
    address: string;
    symbol: string;
    decimals: number;
  };
  collateralAsset: {
    address: string;
    symbol: string;
    decimals: number;
  };
  state: {
    borrowAssets: string;
    supplyAssets: string;
    borrowApy: number;
    supplyApy: number;
    utilization: number;
    fee: string;
  };
}

export interface UserPosition {
  market: {
    uniqueKey: string;
  };
  borrowAssets: string;
  borrowAssetsUsd: string;
  supplyAssets: string;
  supplyAssetsUsd: string;
}

@Injectable()
export class MorphoService {
  private graphqlClient: GraphQLClient;
  
  // Configurações para Base (Chain ID: 8453)
  private readonly MORPHO_API_URL = 'https://api.morpho.org/graphql';
  private readonly BASE_CHAIN_ID = 8453;
  private readonly USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC na Base
  
  constructor() {
    this.graphqlClient = new GraphQLClient(this.MORPHO_API_URL, {
      headers: {
        'User-Agent': 'HackathonQiTech/1.0.0',
      },
    });
  }

  // 🔍 Buscar mercados disponíveis na Base
  async getAvailableMarkets(): Promise<MorphoMarket[]> {
    const query = `
      query GetBaseMarkets {
        markets(
          first: 100
          orderBy: SupplyAssetsUsd
          orderDirection: Desc
          where: { 
            chainId_in: [${this.BASE_CHAIN_ID}]
            whitelisted: true
          }
        ) {
          items {
            uniqueKey
            lltv
            oracleAddress
            irmAddress
            loanAsset {
              address
              symbol
              decimals
            }
            collateralAsset {
              address
              symbol
              decimals
            }
            state {
              borrowAssets
              supplyAssets
              borrowApy
              supplyApy
              utilization
              fee
            }
          }
        }
      }
    `;

    try {
      const response: any = await this.graphqlClient.request(query);
      return response.markets.items;
    } catch (error) {
      console.error('Erro ao buscar mercados Morpho:', error);
      return [];
    }
  }

  // 🎯 Buscar mercado específico por uniqueKey
  async getMarketByKey(uniqueKey: string): Promise<MorphoMarket | null> {
    const query = `
      query GetMarketByKey($uniqueKey: String!, $chainId: Int!) {
        marketByUniqueKey(uniqueKey: $uniqueKey, chainId: $chainId) {
          uniqueKey
          lltv
          oracleAddress
          irmAddress
          loanAsset {
            address
            symbol
            decimals
          }
          collateralAsset {
            address
            symbol
            decimals
          }
          state {
            borrowAssets
            supplyAssets
            borrowApy
            supplyApy
            utilization
            fee
            borrowAssetsUsd
            supplyAssetsUsd
          }
        }
      }
    `;

    try {
      const response: any = await this.graphqlClient.request(query, {
        uniqueKey,
        chainId: this.BASE_CHAIN_ID,
      });
      return response.marketByUniqueKey;
    } catch (error) {
      console.error(`Erro ao buscar mercado ${uniqueKey}:`, error);
      return null;
    }
  }

  // 💰 Buscar posições de um usuário
  async getUserPositions(userAddress: string): Promise<UserPosition[]> {
    const query = `
      query GetUserPositions($userAddress: String!, $chainId: Int!) {
        userByAddress(address: $userAddress, chainId: $chainId) {
          address
          marketPositions {
            market {
              uniqueKey
            }
            borrowAssets
            borrowAssetsUsd
            supplyAssets
            supplyAssetsUsd
          }
        }
      }
    `;

    try {
      const response: any = await this.graphqlClient.request(query, {
        userAddress,
        chainId: this.BASE_CHAIN_ID,
      });
      return response.userByAddress?.marketPositions || [];
    } catch (error) {
      console.error(`Erro ao buscar posições do usuário ${userAddress}:`, error);
      return [];
    }
  }

  // 📊 Buscar dados históricos de APY
  async getMarketHistoricalApy(
    uniqueKey: string,
    startTimestamp: number,
    endTimestamp: number,
    interval: 'HOUR' | 'DAY' | 'WEEK' = 'DAY'
  ) {
    const query = `
      query GetMarketHistoricalApy($uniqueKey: String!, $options: TimeseriesOptions) {
        marketByUniqueKey(uniqueKey: $uniqueKey) {
          uniqueKey
          historicalState {
            supplyApy(options: $options) {
              x
              y
            }
            borrowApy(options: $options) {
              x
              y
            }
          }
        }
      }
    `;

    try {
      const response: any = await this.graphqlClient.request(query, {
        uniqueKey,
        options: {
          startTimestamp,
          endTimestamp,
          interval,
        },
      });
      return response.marketByUniqueKey?.historicalState;
    } catch (error) {
      console.error(`Erro ao buscar histórico APY do mercado ${uniqueKey}:`, error);
      return null;
    }
  }

  // 🔎 Encontrar melhor mercado para commodity específica
  async findBestMarketForCollateral(collateralSymbol: string): Promise<MorphoMarket | null> {
    const markets = await this.getAvailableMarkets();
    
    // Filtrar mercados que aceitam USDC como empréstimo e têm o collateral desejado
    const suitableMarkets = markets.filter(market => 
      market.loanAsset.symbol === 'USDC' &&
      market.collateralAsset.symbol.toLowerCase().includes(collateralSymbol.toLowerCase())
    );

    if (suitableMarkets.length === 0) {
      console.log(`Nenhum mercado encontrado para collateral ${collateralSymbol}`);
      return null;
    }

    // Ordenar por melhor supply APY (maior retorno para investidores)
    suitableMarkets.sort((a, b) => b.state.supplyApy - a.state.supplyApy);
    
    return suitableMarkets[0];
  }

  // 💎 Calcular métricas de um mercado
  async getMarketMetrics(uniqueKey: string) {
    const market = await this.getMarketByKey(uniqueKey);
    if (!market) return null;

    const ltv = parseFloat(market.lltv) / 1e18; // Converter de wei para percentage
    const utilization = market.state.utilization;
    const totalBorrowed = parseFloat(market.state.borrowAssets);
    const totalSupplied = parseFloat(market.state.supplyAssets);

    return {
      uniqueKey: market.uniqueKey,
      ltv: ltv * 100, // Em porcentagem
      utilization: utilization * 100,
      supplyApy: market.state.supplyApy,
      borrowApy: market.state.borrowApy,
      totalBorrowed,
      totalSupplied,
      availableLiquidity: totalSupplied - totalBorrowed,
      loanAsset: market.loanAsset,
      collateralAsset: market.collateralAsset,
      riskLevel: this.calculateRiskLevel(ltv, utilization),
    };
  }

  // 🚨 Calcular nível de risco baseado em LTV e utilização
  private calculateRiskLevel(ltv: number, utilization: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const score = (ltv * 0.6) + (utilization * 0.4); // Peso maior para LTV
    
    if (score < 0.5) return 'LOW';
    if (score < 0.7) return 'MEDIUM';
    if (score < 0.85) return 'HIGH';
    return 'CRITICAL';
  }

  // 🌾 Simular empréstimo para soja (nosso caso de uso)
  async simulateSojaLoan(sojaQuantity: number, requestedUSDC: number) {
    // Por enquanto, vamos simular já que não temos NFT de soja real
    const markets = await this.getAvailableMarkets();
    
    // Encontrar mercado com WETH como collateral (proxy para commodities)
    const wethMarkets = markets.filter(m => 
      m.loanAsset.symbol === 'USDC' && 
      (m.collateralAsset.symbol === 'WETH' || m.collateralAsset.symbol === 'cbETH')
    );

    if (wethMarkets.length === 0) {
      return {
        success: false,
        message: 'Nenhum mercado adequado encontrado',
      };
    }

    const bestMarket = wethMarkets[0];
    const marketMetrics = await this.getMarketMetrics(bestMarket.uniqueKey);

    if (!marketMetrics) {
      return {
        success: false,
        message: 'Erro ao obter métricas do mercado',
      };
    }

    // Simular valor da soja (R$ 180 por saca)
    const sojaValueBRL = sojaQuantity * 180;
    const sojaValueUSDC = sojaValueBRL / 5.5; // Conversão aproximada BRL->USD
    const maxLoanUSDC = sojaValueUSDC * (marketMetrics.ltv / 100);

    return {
      success: true,
      market: bestMarket,
      metrics: marketMetrics,
      simulation: {
        collateralValueUSDC: sojaValueUSDC,
        maxLoanUSDC,
        requestedUSDC,
        isViable: requestedUSDC <= maxLoanUSDC,
        ltv: (requestedUSDC / sojaValueUSDC) * 100,
        estimatedApy: marketMetrics.borrowApy,
      },
    };
  }

  // 📈 Obter preços de ativos
  async getAssetPrices(symbols: string[]): Promise<any[]> {
    const query = `
      query GetAssetPrices($symbols: [String!]!, $chainId: [Int!]!) {
        assets(where: { symbol_in: $symbols, chainId_in: $chainId }) {
          items {
            symbol
            address
            priceUsd
            chain {
              id
              network
            }
          }
        }
      }
    `;

    try {
      const response: any = await this.graphqlClient.request(query, {
        symbols,
        chainId: [this.BASE_CHAIN_ID],
      });
      return response.assets.items;
    } catch (error) {
      console.error('Erro ao buscar preços de ativos:', error);
      return [];
    }
  }
}