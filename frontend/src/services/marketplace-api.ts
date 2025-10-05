import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipos baseados no projeto
export interface Producer {
  id: string;
  name: string;
  location: string;
  cpf: string;
  farmArea: number;
  riskScore: 'A' | 'B' | 'C';
  reputation: number;
  totalLoans: number;
  onTimePayments: number;
}

export interface LoanRequest {
  id: string;
  producerId: string;
  producer: Producer;
  commodity: 'soja';
  region: 'MT';
  requestedAmount: number; // em BRL
  maxInterestRate: number;
  termMonths: number;
  collateralValue: number; // valor da soja em estoque
  collateralAmount: number; // quantidade em sacas
  ltv: number; // loan-to-value ratio
  riskRating: 'A' | 'B' | 'C';
  status: 'open' | 'funding' | 'funded' | 'active' | 'repaid' | 'defaulted';
  currentFunding: number;
  fundingPercentage: number;
  estimatedReturn: number;
  warehouseLocation: string;
  createdAt: string;
  expiresAt: string;
  projectedAPY: number;
  monthlyPayment: number;
}

export interface Investment {
  id: string;
  investorId: string;
  loanRequestId: string;
  amount: number;
  percentage: number;
  expectedReturn: number;
  monthlyReturn: number;
  status: 'active' | 'completed' | 'defaulted';
  investedAt: string;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  totalInvested: number;
  activeInvestments: number;
  totalReturns: number;
  averageReturn: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

export interface WalletInfo {
  address: string;
  privateKey?: string;
  balance: string;
  chainId: number;
}

export interface MarketOverview {
  totalLoanRequests: number;
  totalFunded: number;
  averageAPY: number;
  totalVolume: number;
  successRate: number;
}

// API endpoints para marketplace P2P
export const marketplaceApi = {
  // 🌾 Produtores
  getProducers: async (): Promise<Producer[]> => {
    const response = await api.get('/producers');
    return response.data;
  },

  getProducer: async (id: string): Promise<Producer> => {
    const response = await api.get(`/producers/${id}`);
    return response.data;
  },

  createProducer: async (producer: Partial<Producer>): Promise<Producer> => {
    const response = await api.post('/producers', producer);
    return response.data;
  },

  // 📋 Solicitações de Empréstimo
  getLoanRequests: async (filters?: {
    status?: string;
    riskRating?: string;
    minReturn?: number;
    maxReturn?: number;
  }): Promise<LoanRequest[]> => {
    const response = await api.get('/loan-requests', { params: filters });
    return response.data;
  },

  getLoanRequest: async (id: string): Promise<LoanRequest> => {
    const response = await api.get(`/loan-requests/${id}`);
    return response.data;
  },

  createLoanRequest: async (loanRequest: {
    producerId: string;
    requestedAmount: number;
    maxInterestRate: number;
    termMonths: number;
    collateralAmount: number;
    warehouseLocation: string;
  }): Promise<LoanRequest> => {
    const response = await api.post('/loan-requests', loanRequest);
    return response.data;
  },

  // 💰 Investimentos
  getInvestments: async (investorId?: string): Promise<Investment[]> => {
    const response = await api.get('/investments', { params: { investorId } });
    return response.data;
  },

  createInvestment: async (investment: {
    investorId: string;
    loanRequestId: string;
    amount: number;
  }): Promise<Investment> => {
    const response = await api.post('/investments', investment);
    return response.data;
  },

  // 👤 Investidores
  getInvestors: async (): Promise<Investor[]> => {
    const response = await api.get('/investors');
    return response.data;
  },

  getInvestor: async (id: string): Promise<Investor> => {
    const response = await api.get(`/investors/${id}`);
    return response.data;
  },

  createInvestor: async (investor: Partial<Investor>): Promise<Investor> => {
    const response = await api.post('/investors', investor);
    return response.data;
  },

  // 📊 Overview do Mercado
  getMarketOverview: async (): Promise<MarketOverview> => {
    const response = await api.get('/market/overview');
    return response.data;
  },

  // 🔐 Carteira (integration with existing wallet API)
  generateWallet: async (): Promise<WalletInfo> => {
    const response = await api.post('/wallet/generate');
    return response.data;
  },

  getBalance: async (address: string) => {
    const response = await api.get(`/wallet/balance/${address}`);
    return response.data;
  },

  // 📈 Simulações
  simulateLoan: async (params: {
    collateralAmount: number;
    requestedAmount: number;
    termMonths: number;
  }) => {
    const response = await api.post('/simulate/loan', params);
    return response.data;
  },

  simulateInvestment: async (params: {
    amount: number;
    loanRequestId: string;
  }) => {
    const response = await api.post('/simulate/investment', params);
    return response.data;
  },
};

export default api;