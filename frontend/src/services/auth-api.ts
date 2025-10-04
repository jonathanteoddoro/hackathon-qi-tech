export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'investor' | 'producer';
  smartAccountAddress: string;
  profile: InvestorProfile | ProducerProfile;
  createdAt: string;
}

export interface InvestorProfile {
  investmentInterests: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  preferredTerms: number[];
  totalInvested?: number;
  portfolioValue?: number;
}

export interface ProducerProfile {
  farmName: string;
  location: string;
  cropTypes: string[];
  farmSize: number;
  totalBorrowed?: number;
  creditScore?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  userType: 'investor' | 'producer';
  profile: InvestorProfile | ProducerProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const API_BASE_URL = 'http://localhost:3001/api';

class AuthAPI {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth-v2/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...data,
        profile: data.profile
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao registrar usuário');
    }

    const result = await response.json();
    return {
      token: result.data.token,
      user: result.data.user
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth-v2/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao fazer login');
    }

    const result = await response.json();
    return {
      token: result.data.token,
      user: result.data.user
    };
  }

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth-v2/profile`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao buscar perfil');
    }

    const result = await response.json();
    return result.data;
  }

  async getSmartAccountDetails(token: string): Promise<{ address: string; balance: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/smart-account`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao buscar detalhes da Smart Account');
    }

    return await response.json();
  }
}

export const authAPI = new AuthAPI();