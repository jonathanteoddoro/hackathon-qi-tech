export interface LoanRequest {
  id: string;
  producer: {
    id: string;
    name: string;
    location: string;
    farmName: string;
    riskScore: 'A' | 'B' | 'C';
    reputation: number;
  };
  requestedAmount: number;
  termMonths: number;
  maxInterestRate: number;
  collateralAmount: number;
  collateralType: string;
  warehouseLocation: string;
  warehouseCertificate: string;
  status: 'open' | 'funding' | 'funded' | 'active' | 'completed';
  currentFunding: number;
  fundingPercentage: number;
  createdAt: string;
  expiresAt: string;
  marketId: string;
  ltv?: number;
  projectedAPY?: number;
}

export interface CreateLoanRequest {
  requestedAmount: number;
  termMonths: number;
  maxInterestRate: number;
  collateralAmount: number;
  collateralType: string;
  warehouseLocation: string;
  warehouseCertificate: string;
}

export interface InvestmentRequest {
  loanId: string;
  investmentAmount: number;
}

export interface Investment {
  loanId: string;
  amount: number;
  transactionHash: string;
  investedAt: string;
  loanStatus: string;
  producerName: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

class MarketplaceAPI {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async getAllLoans(): Promise<LoanRequest[]> {
    const response = await fetch(`${API_BASE_URL}/marketplace/loans`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar empréstimos');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro ao carregar empréstimos');
    }

    // Mapear dados para incluir campos calculados
    return result.data.map((loan: any) => ({
      ...loan,
      fundingPercentage: Math.round((loan.currentFunding / loan.requestedAmount) * 100),
      ltv: 70, // Default LTV
      projectedAPY: loan.maxInterestRate
    }));
  }

  async createLoan(data: CreateLoanRequest, token: string): Promise<LoanRequest> {
    const response = await fetch(`${API_BASE_URL}/marketplace/loans`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao criar solicitação de empréstimo');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro ao criar solicitação');
    }

    return result.data;
  }

  async investInLoan(data: InvestmentRequest, token: string): Promise<{
    transactionHash: string;
    updatedLoan: LoanRequest;
  }> {
    const response = await fetch(`${API_BASE_URL}/marketplace/invest`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao investir');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro ao processar investimento');
    }

    return result.data;
  }

  async getMyLoans(token: string): Promise<LoanRequest[]> {
    const response = await fetch(`${API_BASE_URL}/marketplace/my-loans`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar meus empréstimos');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro ao carregar empréstimos');
    }

    return result.data;
  }

  async getMyInvestments(token: string): Promise<Investment[]> {
    const response = await fetch(`${API_BASE_URL}/marketplace/my-investments`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar meus investimentos');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro ao carregar investimentos');
    }

    return result.data;
  }
}

export const marketplaceAPIReal = new MarketplaceAPI();