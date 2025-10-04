export interface AFIRequestData {
  amount: number;
  documentType: 'cda' | 'wa' | 'cpr' | 'production_certificate' | 'harvest_report' | 'warehouse_receipt';
  description: string;
  expectedValue: number;
}

export interface AFIBalance {
  balance: number;
  address: string;
  userType: string;
}

export interface AFITransaction {
  id: string;
  type: 'mint' | 'collateral' | 'transfer';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'active' | 'pending';
}

const API_BASE_URL = 'http://localhost:3001/api';

class AFIAPI {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async requestAFITokens(
    data: AFIRequestData,
    document: File,
    token: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      transactionHash: string;
      amount: number;
      newBalance: string;
      documentAnalysis: any;
    };
  }> {
    const formData = new FormData();
    formData.append('amount', data.amount.toString());
    formData.append('documentType', data.documentType);
    formData.append('description', data.description);
    formData.append('expectedValue', data.expectedValue.toString());
    formData.append('document', document);

    const response = await fetch(`${API_BASE_URL}/afi/request`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao solicitar AFI tokens');
    }

    return await response.json();
  }

  async getAFIBalance(token: string): Promise<AFIBalance> {
    const response = await fetch(`${API_BASE_URL}/afi/balance`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao buscar saldo AFI');
    }

    const result = await response.json();
    return result.data;
  }

  async getAFITransactions(token: string): Promise<AFITransaction[]> {
    const response = await fetch(`${API_BASE_URL}/afi/transactions`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao buscar transações AFI');
    }

    const result = await response.json();
    return result.data.map((tx: any) => ({
      ...tx,
      timestamp: new Date(tx.timestamp)
    }));
  }
}

export const afiAPI = new AFIAPI();