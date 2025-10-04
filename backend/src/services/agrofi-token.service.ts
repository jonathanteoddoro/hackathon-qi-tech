import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { AGROFI_TOKEN_ABI, TokenInvestment, TokenService } from '../types/token.types';

@Injectable()
export class AgroFiTokenService implements TokenService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private masterWallet: ethers.Wallet;
  
  constructor() {
    console.log('🪙 Inicializando AgroFi Token Service...');
    
    // Configurar provider
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    
    // Configurar master wallet
    this.masterWallet = new ethers.Wallet(process.env.MASTER_WALLET_PRIVATE_KEY!, this.provider);
    
    // Carregar endereço do contrato
    const contractAddresses = require('../../contract-addresses.json');
    const contractAddress = contractAddresses.contractAddress;
    
    // Conectar ao contrato
    this.contract = new ethers.Contract(contractAddress, AGROFI_TOKEN_ABI, this.masterWallet);
    
    console.log('✅ AgroFi Token Service inicializado:');
    console.log(`📍 Contrato: ${contractAddress}`);
    console.log(`👤 Master Wallet: ${this.masterWallet.address}`);
  }

  /**
   * Cria tokens AFI baseado em valor fictício em reais
   */
  async mintTokensFromReais(
    userAddress: string, 
    realAmount: number, 
    loanId: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    tokenAmount?: string;
    error?: string;
  }> {
    try {
      console.log('🪙 Mintando tokens AFI:', {
        userAddress,
        realAmount,
        loanId,
        timestamp: new Date().toISOString()
      });

      // Validações
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Endereço do usuário inválido');
      }

      if (realAmount <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      if (!loanId || loanId.trim() === '') {
        throw new Error('ID do empréstimo é obrigatório');
      }

      // Calcular quantidade de tokens (1 real = 1 token)
      const tokenAmount = ethers.parseEther(realAmount.toString());

      // Executar transação de mint
      const tx = await this.contract.mintFromReais(userAddress, realAmount, loanId);
      
      console.log('⏳ Transação enviada. Hash:', tx.hash);
      console.log('🔗 Etherscan:', `https://sepolia.etherscan.io/tx/${tx.hash}`);
      
      // Aguardar confirmação
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('✅ Tokens AFI mintados com sucesso!');
        console.log('📊 Detalhes:', {
          transactionHash: tx.hash,
          tokenAmount: ethers.formatEther(tokenAmount),
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber
        });

        return {
          success: true,
          transactionHash: tx.hash,
          tokenAmount: ethers.formatEther(tokenAmount)
        };
      } else {
        throw new Error('Transação falhou na blockchain');
      }

    } catch (error) {
      console.error('❌ Erro ao mintar tokens AFI:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao mintar tokens'
      };
    }
  }

  /**
   * Queima tokens para resgate
   */
  async burnTokensForRedemption(
    userAddress: string, 
    tokenAmount: string
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    realAmount?: number;
    error?: string;
  }> {
    try {
      console.log('🔥 Queimando tokens AFI para resgate:', {
        userAddress,
        tokenAmount,
        timestamp: new Date().toISOString()
      });

      // Validações
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Endereço do usuário inválido');
      }

      const tokenAmountWei = ethers.parseEther(tokenAmount);
      if (tokenAmountWei <= 0) {
        throw new Error('Quantidade de tokens deve ser maior que zero');
      }

      // Verificar saldo do usuário
      const userBalance = await this.contract.balanceOf(userAddress);
      if (userBalance < tokenAmountWei) {
        throw new Error('Saldo insuficiente de tokens AFI');
      }

      // Executar transação de burn
      const tx = await this.contract.burnForRedemption(userAddress, tokenAmountWei);
      
      console.log('⏳ Transação de burn enviada. Hash:', tx.hash);
      
      // Aguardar confirmação
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        const realAmount = parseFloat(tokenAmount); // 1:1 ratio
        
        console.log('✅ Tokens AFI queimados com sucesso!');
        console.log('📊 Detalhes:', {
          transactionHash: tx.hash,
          tokensBurned: tokenAmount,
          realAmountRedeemed: realAmount,
          gasUsed: receipt.gasUsed.toString()
        });

        return {
          success: true,
          transactionHash: tx.hash,
          realAmount: realAmount
        };
      } else {
        throw new Error('Transação de burn falhou na blockchain');
      }

    } catch (error) {
      console.error('❌ Erro ao queimar tokens AFI:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao queimar tokens'
      };
    }
  }

  /**
   * Obtém saldo de tokens AFI do usuário
   */
  async getUserTokenBalance(userAddress: string): Promise<string> {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Endereço inválido');
      }

      const balance = await this.contract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('❌ Erro ao obter saldo de tokens:', error);
      return '0';
    }
  }

  /**
   * Obtém histórico de investimentos do usuário
   */
  async getUserInvestments(userAddress: string): Promise<TokenInvestment[]> {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Endereço inválido');
      }

      const investments = await this.contract.getUserInvestments(userAddress);
      
      return investments.map((inv: any) => ({
        loanId: inv.loanId,
        realAmount: parseInt(inv.realAmount.toString()),
        tokenAmount: ethers.formatEther(inv.tokenAmount),
        timestamp: parseInt(inv.timestamp.toString()),
        redeemed: inv.redeemed
      }));
    } catch (error) {
      console.error('❌ Erro ao obter investimentos do usuário:', error);
      return [];
    }
  }

  /**
   * Obtém total investido em um empréstimo
   */
  async getLoanTotalFunding(loanId: string): Promise<number> {
    try {
      const totalFunding = await this.contract.getLoanTotalFunding(loanId);
      return parseInt(totalFunding.toString());
    } catch (error) {
      console.error('❌ Erro ao obter funding total do empréstimo:', error);
      return 0;
    }
  }

  /**
   * Obtém informações do contrato
   */
  async getContractInfo(): Promise<{
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    totalReaisInvested: number;
  }> {
    try {
      const [name, symbol, decimals, totalSupply, totalReaisInvested] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply(),
        this.contract.totalReaisInvested()
      ]);

      return {
        address: await this.contract.getAddress(),
        name,
        symbol,
        decimals: parseInt(decimals.toString()),
        totalSupply: ethers.formatEther(totalSupply),
        totalReaisInvested: parseInt(totalReaisInvested.toString())
      };
    } catch (error) {
      console.error('❌ Erro ao obter informações do contrato:', error);
      throw error;
    }
  }
}