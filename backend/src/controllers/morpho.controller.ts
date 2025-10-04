import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MorphoService } from '../services/morpho.service';

@Controller('api/morpho')
export class MorphoController {
  constructor(private readonly morphoService: MorphoService) {}

  // 📊 Listar mercados disponíveis na Base
  @Get('markets')
  async getMarkets() {
    return await this.morphoService.getAvailableMarkets();
  }

  // 🎯 Obter detalhes de um mercado específico
  @Get('market/:uniqueKey')
  async getMarket(@Param('uniqueKey') uniqueKey: string) {
    return await this.morphoService.getMarketByKey(uniqueKey);
  }

  // 📈 Métricas de um mercado
  @Get('market/:uniqueKey/metrics')
  async getMarketMetrics(@Param('uniqueKey') uniqueKey: string) {
    return await this.morphoService.getMarketMetrics(uniqueKey);
  }

  // 👤 Posições de um usuário
  @Get('user/:address/positions')
  async getUserPositions(@Param('address') address: string) {
    return await this.morphoService.getUserPositions(address);
  }

  // 📊 Histórico de APY
  @Get('market/:uniqueKey/history')
  async getMarketHistory(
    @Param('uniqueKey') uniqueKey: string,
    @Query('startTimestamp') startTimestamp?: string,
    @Query('endTimestamp') endTimestamp?: string,
    @Query('interval') interval?: 'HOUR' | 'DAY' | 'WEEK'
  ) {
    const start = startTimestamp ? parseInt(startTimestamp) : Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60; // 7 dias atrás
    const end = endTimestamp ? parseInt(endTimestamp) : Math.floor(Date.now() / 1000);
    
    return await this.morphoService.getMarketHistoricalApy(
      uniqueKey,
      start,
      end,
      interval || 'DAY'
    );
  }

  // 🔎 Encontrar melhor mercado para collateral
  @Get('markets/search')
  async findMarketForCollateral(@Query('collateral') collateral: string) {
    if (!collateral) {
      return { error: 'Parâmetro collateral é obrigatório' };
    }
    return await this.morphoService.findBestMarketForCollateral(collateral);
  }

  // 🌾 Simular empréstimo com soja
  @Post('simulate/soja-loan')
  async simulateSojaLoan(@Body() simulationDto: {
    sojaQuantity: number;
    requestedUSDC: number;
  }) {
    return await this.morphoService.simulateSojaLoan(
      simulationDto.sojaQuantity,
      simulationDto.requestedUSDC
    );
  }

  // 💰 Preços de ativos
  @Get('prices')
  async getAssetPrices(@Query('symbols') symbols?: string) {
    const symbolsArray = symbols ? symbols.split(',') : ['USDC', 'WETH', 'cbETH'];
    return await this.morphoService.getAssetPrices(symbolsArray);
  }

  // 🎯 Integração específica para nosso sistema
  @Post('integrate/proposal')
  async integrateWithProposal(@Body() integrationDto: {
    proposalId: string;
    producerName: string;
    sojaQuantity: number;
    requestedAmountBRL: number;
  }) {
    // Converter BRL para USDC
    const usdcAmount = integrationDto.requestedAmountBRL / 5.5; // Conversão aproximada

    // Simular empréstimo
    const simulation = await this.morphoService.simulateSojaLoan(
      integrationDto.sojaQuantity,
      usdcAmount
    );

    if (!simulation.success) {
      return {
        success: false,
        message: 'Não foi possível simular o empréstimo no Morpho',
        simulation,
      };
    }

    // Retornar dados para integração
    return {
      success: true,
      proposalId: integrationDto.proposalId,
      morphoData: {
        marketKey: simulation.market?.uniqueKey,
        maxLoanUSDC: simulation.simulation?.maxLoanUSDC,
        requestedUSDC: usdcAmount,
        isViable: simulation.simulation?.isViable,
        estimatedApy: simulation.simulation?.estimatedApy,
        ltv: simulation.simulation?.ltv,
        collateralValueUSDC: simulation.simulation?.collateralValueUSDC,
      },
      nextSteps: [
        '1. Tokenizar soja em NFT ERC-721',
        '2. Aprovar NFT como collateral no Morpho',
        '3. Criar posição de empréstimo',
        '4. Investidores podem fornecer USDC ao market',
        '5. Morpho automaticamente conecta supply/borrow',
      ],
    };
  }

  // 📊 Dashboard integrado com dados do Morpho
  @Get('dashboard/market-overview')
  async getMarketDashboard() {
    const markets = await this.morphoService.getAvailableMarkets();
    const usdcMarkets = markets.filter(m => m.loanAsset.symbol === 'USDC');
    
    const dashboard = {
      totalMarkets: markets.length,
      usdcMarkets: usdcMarkets.length,
      topMarkets: usdcMarkets
        .sort((a, b) => b.state.supplyApy - a.state.supplyApy)
        .slice(0, 5)
        .map(market => ({
          uniqueKey: market.uniqueKey,
          collateral: market.collateralAsset.symbol,
          supplyApy: market.state.supplyApy,
          borrowApy: market.state.borrowApy,
          utilization: market.state.utilization,
          tvl: parseFloat(market.state.supplyAssets),
        })),
      avgSupplyApy: usdcMarkets.reduce((sum, m) => sum + m.state.supplyApy, 0) / usdcMarkets.length,
      avgBorrowApy: usdcMarkets.reduce((sum, m) => sum + m.state.borrowApy, 0) / usdcMarkets.length,
    };

    return dashboard;
  }
}