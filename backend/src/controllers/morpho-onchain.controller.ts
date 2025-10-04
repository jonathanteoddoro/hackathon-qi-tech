import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MorphoOnChainService, MorphoLoanParams } from '../services/morpho-onchain.service';

export class CreateLoanDto {
  collateralAmount: string;
  borrowAmount: string;
  userAddress: string;
  userPrivateKey: string;
  marketId: string;
}

export class GetPositionDto {
  marketId: string;
  userAddress: string;
}

@Controller('api/morpho-onchain')
export class MorphoOnchainController {
  constructor(private readonly morphoOnchainService: MorphoOnChainService) {}

  // 🚀 Criar empréstimo real na blockchain
  @Post('create-loan')
  async createLoan(@Body() createLoanDto: CreateLoanDto) {
    console.log('🎯 Iniciando criação de empréstimo onchain:', {
      collateral: createLoanDto.collateralAmount,
      borrow: createLoanDto.borrowAmount,
      market: createLoanDto.marketId,
      user: createLoanDto.userAddress
    });

    const result = await this.morphoOnchainService.createMorphoLoan({
      collateralAmount: createLoanDto.collateralAmount,
      borrowAmount: createLoanDto.borrowAmount,
      userAddress: createLoanDto.userAddress,
      userPrivateKey: createLoanDto.userPrivateKey,
      marketId: createLoanDto.marketId,
    });

    return {
      success: result.success,
      transactionHash: result.transactionHash,
      loanDetails: result.loanDetails,
      error: result.error,
      network: 'Base Sepolia',
      timestamp: new Date().toISOString(),
    };
  }

  // 📊 Verificar posição do usuário
  @Post('user-position')
  async getUserPosition(@Body() getPositionDto: GetPositionDto) {
    console.log('🔍 Verificando posição do usuário:', getPositionDto);

    const position = await this.morphoOnchainService.getUserPosition(
      getPositionDto.marketId,
      getPositionDto.userAddress
    );

    return {
      success: true,
      position,
      marketId: getPositionDto.marketId,
      userAddress: getPositionDto.userAddress,
      network: 'Base Sepolia',
      timestamp: new Date().toISOString(),
    };
  }

  // 💰 Simular empréstimo antes de executar
  @Post('simulate-loan')
  async simulateLoan(@Body() simulateDto: { collateralAmount: string; targetLtv?: number }) {
    console.log('🎮 Simulando empréstimo:', simulateDto);

    const simulation = await this.morphoOnchainService.simulateLoan(
      simulateDto.collateralAmount,
      simulateDto.targetLtv || 0.7
    );

    return {
      success: true,
      simulation,
      network: 'Base Sepolia',
      timestamp: new Date().toISOString(),
    };
  }

  // 🌐 Informações da rede
  @Get('network-info')
  async getNetworkInfo() {
    return {
      network: 'Base Sepolia',
      chainId: 84532,
      rpcUrl: 'https://sepolia.base.org',
      morphoAddress: '0x64c7044050Ba0431252df24fEd4d9635a275CB41',
      usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      explorer: 'https://sepolia.basescan.org',
      faucets: [
        'https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet',
        'https://sepolia.base.org/bridge'
      ]
    };
  }
}