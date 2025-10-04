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

export interface P2PPosition {
  loanId: string;
  borrower: string;
  lender: string;
  principal: string;
  collateral: string;
  interestAccrued: string;
  healthFactor: string;
  status: 'ACTIVE' | 'LIQUIDATED' | 'REPAID';
  maturityDate: string;
  transactionHash?: string;
  morphoMarketId?: string;
}

export interface P2PStats {
  totalLent: number;
  totalBorrowed: number;
  activeLendingPositions: number;
  activeBorrowingPositions: number;
  averageHealthFactor: number;
  totalInterestEarned: number;
}

const API_BASE_URL = 'http://localhost:3001';

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

  // Interceptor para tratar erros de JWT
  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const errorText = await response.text();

      // Verificar se é erro de JWT
      if (response.status === 401 ||
          errorText.includes('TOKEN_INVALID_SIGNATURE') ||
          errorText.includes('TOKEN_EXPIRED') ||
          errorText.includes('TOKEN_VALIDATION_ERROR') ||
          errorText.includes('Token inválido')) {

        console.warn('🔑 Token inválido detectado, forçando logout imediato...');

        // Limpar todos os tokens
        localStorage.removeItem('agrofi_token');
        sessionStorage.removeItem('agrofi_token');
        localStorage.removeItem('agrofi_user');

        // Mostrar alerta e redirecionar
        alert('Token inválido detectado. Você será redirecionado para fazer login novamente.');

        // Redirecionar para página inicial (limpa estado)
        window.location.href = window.location.origin;

        // Nunca chegará aqui, mas por segurança
        throw new Error('Token inválido. Redirecionando...');
      }

      throw new Error(errorText || 'Erro na requisição');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro na resposta da API');
    }

    return result;
  }

  async getAllLoans(): Promise<LoanRequest[]> {
    const response = await fetch(`${API_BASE_URL}/marketplace/loans`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse(response);

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
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...data,
        producerToken: token
      }),
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
    const response = await fetch(`${API_BASE_URL}/marketplace/loans/${data.loanId}/invest`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        investmentAmount: data.investmentAmount
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao investir');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro ao processar investimento');
    }

    return {
      transactionHash: result.data.transactionHash,
      updatedLoan: result.data.updatedLoan
    };
  }

  async getMyLoans(token: string): Promise<LoanRequest[]> {
    const response = await fetch(`${API_BASE_URL}/marketplace/my-loans`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    const result = await this.handleResponse(response);
    return result.data;
  }

  async getMyInvestments(token: string): Promise<Investment[]> {
    const response = await fetch(`${API_BASE_URL}/marketplace/my-investments`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    const result = await this.handleResponse(response);
    return result.data;
  }

  async getP2PPosition(loanId: string, token: string): Promise<P2PPosition> {
    const response = await fetch(`${API_BASE_URL}/marketplace/loans/${loanId}/position`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    const result = await this.handleResponse(response);
    return result.data;
  }

  async getMorphoConfig(): Promise<{
    markets: string[];
    supportedCollaterals: string[];
    currentRates: Record<string, number>;
  }> {
    const response = await fetch(`${API_BASE_URL}/marketplace/config`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar configurações do Morpho');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro ao carregar configurações');
    }

    return result.data;
  }

  async getMarketplaceStats(): Promise<{
    totalLoans: number;
    totalFunding: number;
    averageInterestRate: number;
    activeLoans: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/marketplace/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar estatísticas do marketplace');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Erro ao carregar estatísticas');
    }

    return result.data;
  }
}

export const marketplaceAPIReal = new MarketplaceAPI();