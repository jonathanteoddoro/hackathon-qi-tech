import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface WalletInfo {
  address: string;
  privateKey?: string;
  balance: string;
  chainId: number;
}

export interface BalanceInfo {
  address: string;
  ethBalance: string;
  usdcBalance: string;
  chainId: number;
  network: string;
}

export interface LoanSimulation {
  collateralAmount: string;
  maxBorrowAmount: string;
  recommendedBorrowAmount: string;
  estimatedApy: number;
  monthlyInterest: string;
  liquidationPrice: string;
  healthFactor: string;
}

export interface SojaLoanComplete {
  simulation: LoanSimulation;
  walletInfo: BalanceInfo;
  loanParams: {
    collateralAmount: string;
    borrowAmount: string;
    userAddress: string;
    marketId: string;
  };
  nextSteps: string[];
}

export interface MorphoMarket {
  uniqueKey: string;
  loanAsset: {
    symbol: string;
    address: string;
  };
  collateralAsset: {
    symbol: string;
    address: string;
  };
  state: {
    borrowApy: number;
    supplyApy: number;
    utilization: number;
    borrowAssets: string;
    supplyAssets: string;
  };
}

// 🔐 Wallet endpoints
export const walletApi = {
  generate: async (): Promise<WalletInfo> => {
    const response = await api.post('/wallet/generate');
    return response.data;
  },

  getBalance: async (address: string): Promise<BalanceInfo> => {
    const response = await api.get(`/wallet/balance/${address}`);
    return response.data;
  },

  getNetworkConfig: async () => {
    const response = await api.get('/wallet/network');
    return response.data;
  },
};

// 🏦 Morpho On-Chain endpoints
export const morphoOnChainApi = {
  simulateLoan: async (collateralAmount: string, targetLtv: number = 0.7): Promise<LoanSimulation> => {
    const response = await api.post('/morpho-onchain/simulate-loan', {
      collateralAmount,
      targetLtv,
    });
    return response.data;
  },

  createSojaLoanComplete: async (
    userPrivateKey: string,
    sojaAmount: number,
    sojaPrice: number,
    ltvRatio: number = 0.7
  ): Promise<SojaLoanComplete> => {
    const response = await api.post('/morpho-onchain/soja-loan-complete', {
      userPrivateKey,
      sojaAmount,
      sojaPrice,
      ltvRatio,
    });
    return response.data;
  },

  getNetworkConfig: async () => {
    const response = await api.get('/morpho-onchain/network-config');
    return response.data;
  },
};

// 📊 Morpho API endpoints
export const morphoApi = {
  getMarkets: async (): Promise<MorphoMarket[]> => {
    const response = await api.get('/morpho/markets');
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/morpho/dashboard/market-overview');
    return response.data;
  },

  simulateSojaLoan: async (amount: number) => {
    const response = await api.post('/morpho/simulate/soja-loan', { amount });
    return response.data;
  },
};

// 🌾 Proposal endpoints
export const proposalApi = {
  getOpportunities: async () => {
    const response = await api.get('/opportunities');
    return response.data;
  },

  createProposal: async (proposal: any) => {
    const response = await api.post('/proposals', proposal);
    return response.data;
  },

  invest: async (investment: any) => {
    const response = await api.post('/investments', investment);
    return response.data;
  },
};

export default api;