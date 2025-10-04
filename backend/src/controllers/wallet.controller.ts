import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { MorphoOnChainService } from '../services/morpho-onchain.service';
import type { WalletInfo, TransactionResult } from '../services/wallet.service';
import type { MorphoLoanParams, MorphoLoanResult } from '../services/morpho-onchain.service';

@Controller('api/wallet')
export class WalletController {
  constructor(
    private walletService: WalletService,
    private morphoOnChainService: MorphoOnChainService,
  ) {}

  // 🆕 Gerar nova carteira de teste
  @Post('generate')
  async generateWallet(): Promise<WalletInfo> {
    return await this.walletService.generateTestWallet();
  }

  // 💰 Verificar saldo
  @Get('balance/:address')
  async getBalance(@Param('address') address: string) {
    if (!this.walletService.isValidAddress(address)) {
      throw new Error('Endereço inválido');
    }

    const ethBalance = await this.walletService.getEthBalance(address);
    const usdcBalance = await this.walletService.getUsdcBalance(address);

    return {
      address,
      ethBalance,
      usdcBalance,
      chainId: 84532,
      network: 'Base Sepolia',
    };
  }

  // 📤 Transferir ETH
  @Post('transfer/eth')
  async transferEth(@Body() body: {
    fromPrivateKey: string;
    toAddress: string;
    amount: string;
  }): Promise<TransactionResult> {
    return await this.walletService.transferEth(
      body.fromPrivateKey,
      body.toAddress,
      body.amount
    );
  }

  // 💵 Transferir USDC
  @Post('transfer/usdc')
  async transferUsdc(@Body() body: {
    fromPrivateKey: string;
    toAddress: string;
    amount: string;
  }): Promise<TransactionResult> {
    return await this.walletService.transferUsdc(
      body.fromPrivateKey,
      body.toAddress,
      body.amount
    );
  }

  // 💳 Importar carteira
  @Post('import')
  async importWallet(@Body() body: {
    privateKey: string;
  }): Promise<WalletInfo> {
    return await this.walletService.importWallet(body.privateKey);
  }

  // ⛽ Estimar gas
  @Post('estimate-gas')
  async estimateGas(@Body() body: {
    fromAddress: string;
    toAddress: string;
    amount: string;
    isUsdc?: boolean;
  }) {
    const gasEstimate = await this.walletService.estimateGas(
      body.fromAddress,
      body.toAddress,
      body.amount,
      body.isUsdc || false
    );

    return {
      gasEstimate,
      estimatedCostEth: '0.001', // Simplificado
      network: 'Base Sepolia',
    };
  }

  // 🌐 Informações da rede
  @Get('network')
  async getNetworkInfo() {
    return this.walletService.getChainConfig();
  }
}

@Controller('api/morpho-onchain')
export class MorphoOnChainController {
  constructor(
    private morphoOnChainService: MorphoOnChainService,
    private walletService: WalletService,
  ) {}

  // 🏦 Criar empréstimo real no Morpho
  @Post('create-loan')
  async createLoan(@Body() body: MorphoLoanParams): Promise<MorphoLoanResult> {
    console.log('🎯 Criando empréstimo on-chain:', body);
    return await this.morphoOnChainService.createMorphoLoan(body);
  }

  // 🎮 Simular empréstimo (sem executar)
  @Post('simulate-loan')
  async simulateLoan(@Body() body: {
    collateralAmount: string;
    targetLtv?: number;
  }) {
    const ltv = body.targetLtv || 0.7;
    return await this.morphoOnChainService.simulateLoan(body.collateralAmount, ltv);
  }

  // 📊 Verificar posição do usuário
  @Get('position/:marketId/:userAddress')
  async getUserPosition(
    @Param('marketId') marketId: string,
    @Param('userAddress') userAddress: string,
  ) {
    return await this.morphoOnChainService.getUserPosition(marketId, userAddress);
  }

  // 💸 Pagar empréstimo
  @Post('repay-loan')
  async repayLoan(@Body() body: {
    marketId: string;
    repayAmount: string;
    userPrivateKey: string;
  }): Promise<MorphoLoanResult> {
    return await this.morphoOnChainService.repayLoan(
      body.marketId,
      body.repayAmount,
      body.userPrivateKey
    );
  }

  // 🏦 Informações do mercado
  @Get('market/:marketId')
  async getMarketInfo(@Param('marketId') marketId: string) {
    return await this.morphoOnChainService.getMarketInfo(marketId);
  }

  // ⚙️ Configurações da rede
  @Get('network-config')
  async getNetworkConfig() {
    return this.morphoOnChainService.getNetworkConfig();
  }

  // 🔗 Obter URL do explorer
  @Get('explorer/:txHash')
  async getExplorerUrl(@Param('txHash') txHash: string) {
    return {
      txHash,
      explorerUrl: this.morphoOnChainService.getExplorerUrl(txHash),
    };
  }

  // 🌟 Fluxo completo: Criar empréstimo para soja
  @Post('soja-loan-complete')
  async createSojaLoanComplete(@Body() body: {
    userPrivateKey: string;
    sojaAmount: number; // toneladas
    sojaPrice: number; // USD por tonelada
    ltvRatio?: number; // Loan-to-Value ratio
  }) {
    try {
      const wallet = await this.walletService.importWallet(body.userPrivateKey);
      
      // Calcular valor do colateral em USDC
      const collateralValue = body.sojaAmount * body.sojaPrice;
      const ltv = body.ltvRatio || 0.7;
      const borrowAmount = collateralValue * ltv;
      
      console.log(`🌾 Empréstimo de soja:
        - ${body.sojaAmount} toneladas × $${body.sojaPrice} = $${collateralValue}
        - LTV ${(ltv * 100).toFixed(0)}%
        - Empréstimo: $${borrowAmount.toFixed(2)} USDC
        - Carteira: ${wallet.address}
      `);

      // Simular primeiro
      const simulation = await this.morphoOnChainService.simulateLoan(
        collateralValue.toString(),
        ltv
      );

      return {
        simulation,
        walletInfo: {
          address: wallet.address,
          ethBalance: wallet.balance,
          usdcBalance: await this.walletService.getUsdcBalance(wallet.address),
        },
        loanParams: {
          collateralAmount: collateralValue.toString(),
          borrowAmount: borrowAmount.toString(),
          userAddress: wallet.address,
          marketId: 'USDC-SOJA-MARKET', // ID simulado
        },
        nextSteps: [
          '1. Obter USDC de teste no faucet',
          '2. Executar createLoan com os parâmetros acima',
          '3. Verificar transação no Base Sepolia Explorer',
        ],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}