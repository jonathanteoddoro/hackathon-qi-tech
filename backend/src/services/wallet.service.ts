import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

export interface WalletInfo {
  address: string;
  privateKey?: string; // Only for testing - NEVER store in production
  balance: string;
  chainId: number;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  gasUsed?: string;
  error?: string;
}

@Injectable()
export class WalletService {
  private provider: ethers.Provider;
  private readonly CHAIN_CONFIG = {
    // Base Sepolia Testnet
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    // Contratos de teste
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC na Base Sepolia
    morphoAddress: '0x64c7044050Ba0431252df24fEd4d9635a275CB41', // Morpho na Base Sepolia
  };

  constructor() {
    this.provider = new ethers.JsonRpcProvider(this.CHAIN_CONFIG.rpcUrl);
  }

  // 🎯 Gerar carteira nova para teste
  async generateTestWallet(): Promise<WalletInfo> {
    const wallet = ethers.Wallet.createRandom();
    const connectedWallet = wallet.connect(this.provider);
    
    const balance = await this.provider.getBalance(wallet.address);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey, // ⚠️ APENAS PARA TESTES
      balance: ethers.formatEther(balance),
      chainId: this.CHAIN_CONFIG.chainId,
    };
  }

  // 💰 Verificar saldo de ETH
  async getEthBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error(`Erro ao obter saldo de ${address}:`, error);
      return '0';
    }
  }

  // 💵 Verificar saldo de USDC
  async getUsdcBalance(address: string): Promise<string> {
    try {
      const usdcContract = new ethers.Contract(
        this.CHAIN_CONFIG.usdcAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
        ],
        this.provider
      );

      const balance = await usdcContract.balanceOf(address);
      const decimals = await usdcContract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error(`Erro ao obter saldo USDC de ${address}:`, error);
      return '0';
    }
  }

  // 📤 Transferir ETH
  async transferEth(
    fromPrivateKey: string,
    toAddress: string,
    amount: string
  ): Promise<TransactionResult> {
    try {
      const wallet = new ethers.Wallet(fromPrivateKey, this.provider);
      
      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amount),
      });

      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        success: receipt?.status === 1,
        gasUsed: receipt?.gasUsed?.toString(),
      };
    } catch (error) {
      console.error('Erro ao transferir ETH:', error);
      return {
        hash: '',
        success: false,
        error: error.message,
      };
    }
  }

  // 💵 Transferir USDC
  async transferUsdc(
    fromPrivateKey: string,
    toAddress: string,
    amount: string
  ): Promise<TransactionResult> {
    try {
      const wallet = new ethers.Wallet(fromPrivateKey, this.provider);
      
      const usdcContract = new ethers.Contract(
        this.CHAIN_CONFIG.usdcAddress,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function decimals() view returns (uint8)',
        ],
        wallet
      );

      const decimals = await usdcContract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);
      
      const tx = await usdcContract.transfer(toAddress, amountWei);
      const receipt = await tx.wait();
      
      return {
        hash: tx.hash,
        success: receipt?.status === 1,
        gasUsed: receipt?.gasUsed?.toString(),
      };
    } catch (error) {
      console.error('Erro ao transferir USDC:', error);
      return {
        hash: '',
        success: false,
        error: error.message,
      };
    }
  }

  // 🔗 Obter informações da rede
  getChainConfig() {
    return this.CHAIN_CONFIG;
  }

  // 🌐 Obter block explorer URL
  getExplorerUrl(txHash: string): string {
    return `${this.CHAIN_CONFIG.blockExplorer}/tx/${txHash}`;
  }

  // 💳 Importar carteira existente
  async importWallet(privateKey: string): Promise<WalletInfo> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const balance = await this.provider.getBalance(wallet.address);
      
      return {
        address: wallet.address,
        balance: ethers.formatEther(balance),
        chainId: this.CHAIN_CONFIG.chainId,
      };
    } catch (error) {
      throw new Error(`Erro ao importar carteira: ${error.message}`);
    }
  }

  // 🔍 Verificar se endereço é válido
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  // ⛽ Estimar gas para transação
  async estimateGas(
    fromAddress: string,
    toAddress: string,
    amount: string,
    isUsdc: boolean = false
  ): Promise<string> {
    try {
      if (isUsdc) {
        const usdcContract = new ethers.Contract(
          this.CHAIN_CONFIG.usdcAddress,
          ['function transfer(address to, uint256 amount) returns (bool)'],
          this.provider
        );
        
        const decimals = 6; // USDC tem 6 decimais
        const amountWei = ethers.parseUnits(amount, decimals);
        const gasEstimate = await usdcContract.transfer.estimateGas(toAddress, amountWei);
        
        return gasEstimate.toString();
      } else {
        const gasEstimate = await this.provider.estimateGas({
          from: fromAddress,
          to: toAddress,
          value: ethers.parseEther(amount),
        });
        
        return gasEstimate.toString();
      }
    } catch (error) {
      console.error('Erro ao estimar gas:', error);
      return '21000'; // Gas padrão para transferência simples
    }
  }
}