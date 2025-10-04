import { ethers } from 'ethers';

// ABI simplificada do contrato AgroFi Token
export const AGROFI_TOKEN_ABI = [
  // Funções de leitura
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // Funções de transfer
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  
  // Funções específicas do AgroFi
  "function mintFromReais(address to, uint256 realAmount, string loanId)",
  "function burnForRedemption(address from, uint256 tokenAmount)",
  "function getUserInvestments(address user) view returns (tuple(string loanId, uint256 realAmount, uint256 tokenAmount, uint256 timestamp, bool redeemed)[])",
  "function getLoanTotalFunding(string loanId) view returns (uint256)",
  "function getLoanInvestors(string loanId) view returns (address[])",
  "function reaisToTokens(uint256 realAmount) view returns (uint256)",
  "function tokensToReais(uint256 tokenAmount) view returns (uint256)",
  "function totalReaisInvested() view returns (uint256)",
  
  // Eventos
  "event TokensMintedFromReais(address indexed to, uint256 realAmount, uint256 tokenAmount)",
  "event TokensBurnedForRedemption(address indexed from, uint256 tokenAmount, uint256 realAmount)",
  "event InvestmentRecorded(address indexed investor, string loanId, uint256 realAmount, uint256 tokenAmount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export interface TokenInvestment {
  loanId: string;
  realAmount: number;
  tokenAmount: string;
  timestamp: number;
  redeemed: boolean;
}

export interface TokenService {
  mintTokensFromReais(userAddress: string, realAmount: number, loanId: string): Promise<{
    success: boolean;
    transactionHash?: string;
    tokenAmount?: string;
    error?: string;
  }>;
  
  burnTokensForRedemption(userAddress: string, tokenAmount: string): Promise<{
    success: boolean;
    transactionHash?: string;
    realAmount?: number;
    error?: string;
  }>;
  
  getUserTokenBalance(userAddress: string): Promise<string>;
  getUserInvestments(userAddress: string): Promise<TokenInvestment[]>;
  getLoanTotalFunding(loanId: string): Promise<number>;
}