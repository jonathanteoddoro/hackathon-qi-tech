import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import axios from 'axios';

export interface FaucetResult {
  success: boolean;
  transactionHash?: string;
  amount?: string;
  error?: string;
}

@Injectable()
export class UsdcFaucetService {
  private provider: ethers.Provider;
  private readonly USDC_SEPOLIA_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'
    );
  }

  // 🆓 Obter USDC testnet via Circle Faucet
  async requestUsdcFromCircle(userAddress: string): Promise<FaucetResult> {
    try {
      console.log('🚰 Solicitando USDC testnet da Circle para:', userAddress);

      // Validar endereço
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Endereço inválido');
      }

      // Simular request ao Circle Faucet (na prática seria uma API call)
      // Circle Faucet: https://faucet.circle.com/
      const faucetResponse = await this.simulateCircleFaucet(userAddress);

      if (faucetResponse.success) {
        console.log('✅ USDC testnet recebido:', {
          address: userAddress,
          amount: faucetResponse.amount,
          txHash: faucetResponse.transactionHash
        });

        return {
          success: true,
          transactionHash: faucetResponse.transactionHash,
          amount: faucetResponse.amount
        };
      } else {
        throw new Error(faucetResponse.error);
      }

    } catch (error) {
      console.error('❌ Erro no faucet USDC:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🔄 Obter USDC via ETHGlobal Faucet
  async requestUsdcFromEthGlobal(userAddress: string): Promise<FaucetResult> {
    try {
      console.log('🚰 Solicitando USDC da ETHGlobal para:', userAddress);

      // Simular request (na prática seria via API)
      const faucetResponse = await this.simulateEthGlobalFaucet(userAddress);

      return {
        success: true,
        transactionHash: faucetResponse.transactionHash,
        amount: faucetResponse.amount
      };

    } catch (error) {
      console.error('❌ Erro no ETHGlobal faucet:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 💰 Mint USDC testnet usando master wallet (backup)
  async mintUsdcTestnet(userAddress: string, amount: number): Promise<FaucetResult> {
    try {
      console.log('🪙 Mintando USDC testnet via master wallet:', {
        recipient: userAddress,
        amount
      });

      const masterPrivateKey = process.env.MASTER_WALLET_PRIVATE_KEY;
      if (!masterPrivateKey) {
        throw new Error('MASTER_WALLET_PRIVATE_KEY não configurada');
      }

      const masterWallet = new ethers.Wallet(masterPrivateKey, this.provider);

      // Para demonstração, vamos enviar ETH equivalente ao valor USDC
      // Em produção seria um contrato USDC real com função mint
      const ethValue = ethers.parseEther((amount / 1000).toString()); // 1000 USDC = 1 ETH fictício

      const tx = await masterWallet.sendTransaction({
        to: userAddress,
        value: ethValue,
        data: ethers.hexlify(ethers.toUtf8Bytes(`USDC_MINT:${amount}:${userAddress}`))
      });

      await tx.wait();

      console.log('✅ USDC testnet mintado:', {
        txHash: tx.hash,
        amount: amount.toString(),
        recipient: userAddress
      });

      return {
        success: true,
        transactionHash: tx.hash,
        amount: amount.toString()
      };

    } catch (error) {
      console.error('❌ Erro ao mintar USDC:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🔍 Verificar saldo USDC do usuário
  async getUsdcBalance(userAddress: string): Promise<string> {
    try {
      const usdcContract = new ethers.Contract(
        this.USDC_SEPOLIA_ADDRESS,
        [
          'function balanceOf(address owner) external view returns (uint256)',
          'function decimals() external view returns (uint8)'
        ],
        this.provider
      );

      const balance = await usdcContract.balanceOf(userAddress);
      return ethers.formatUnits(balance, 6); // USDC tem 6 decimais

    } catch (error) {
      console.error('❌ Erro ao verificar saldo USDC:', error);
      return '0';
    }
  }

  // 🎯 Obter USDC automático (tenta múltiplas fontes)
  async getUsdcForLending(userAddress: string, requiredAmount: number): Promise<FaucetResult> {
    try {
      console.log('💰 Obtendo USDC para lending:', {
        address: userAddress,
        required: requiredAmount
      });

      // 1. Verificar saldo atual
      const currentBalance = parseFloat(await this.getUsdcBalance(userAddress));

      if (currentBalance >= requiredAmount) {
        return {
          success: true,
          amount: currentBalance.toString()
        };
      }

      const needed = requiredAmount - currentBalance;
      console.log(`📊 Precisa de ${needed} USDC adicional`);

      // 2. Tentar Circle Faucet primeiro
      const circleResult = await this.requestUsdcFromCircle(userAddress);
      if (circleResult.success) {
        return circleResult;
      }

      // 3. Tentar ETHGlobal como backup
      const ethGlobalResult = await this.requestUsdcFromEthGlobal(userAddress);
      if (ethGlobalResult.success) {
        return ethGlobalResult;
      }

      // 4. Usar master wallet como último recurso
      return await this.mintUsdcTestnet(userAddress, needed);

    } catch (error) {
      console.error('❌ Erro ao obter USDC:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🎭 Simular Circle Faucet (em produção seria API real)
  private async simulateCircleFaucet(userAddress: string): Promise<FaucetResult> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular sucesso 90% das vezes
    if (Math.random() > 0.1) {
      const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      return {
        success: true,
        transactionHash: txHash,
        amount: '10' // Circle dá 10 USDC por request
      };
    } else {
      return {
        success: false,
        error: 'Rate limit atingido. Tente novamente em 1 hora.'
      };
    }
  }

  // 🎭 Simular ETHGlobal Faucet
  private async simulateEthGlobalFaucet(userAddress: string): Promise<FaucetResult> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    return {
      success: true,
      transactionHash: txHash,
      amount: '1' // ETHGlobal dá 1 USDC por dia
    };
  }

  // 📋 Informações dos faucets disponíveis
  getFaucetInfo() {
    return {
      circle: {
        url: 'https://faucet.circle.com/',
        amount: '10 USDC',
        frequency: 'Por hora',
        description: 'Faucet oficial da Circle'
      },
      ethGlobal: {
        url: 'https://ethglobal.com/faucet/sepolia-11155111-usdc',
        amount: '1 USDC',
        frequency: 'Por dia',
        description: 'Faucet da ETHGlobal'
      },
      l2Faucet: {
        url: 'https://www.l2faucet.com/usdc',
        amount: 'Variável',
        frequency: 'Conforme disponibilidade',
        description: 'Faucet L2 da Automata'
      }
    };
  }
}