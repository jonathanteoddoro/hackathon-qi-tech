import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface UserProfile {
  id: string;
  email: string;
  userType: 'investor' | 'producer';
  smartAccountAddress?: string;
  eoaAddress?: string;
  privateKey?: string; // Apenas para desenvolvimento
  profile: {
    name: string;
    avatar?: string;
    // Específico para produtor
    farmName?: string;
    location?: string;
    cropTypes?: string[];
    farmSize?: number;
    // Específico para investidor
    investmentStrategy?: string;
    riskTolerance?: 'low' | 'medium' | 'high';
    totalInvested?: number;
  };
  createdAt: Date;
  lastLogin: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  userType: 'investor' | 'producer';
  name: string;
  profile: any;
}

export interface SmartAccountDetails {
  smartAccountAddress: string;
  eoaAddress: string;
  privateKey: string;
  balance: string;
  nonce: number;
  network: string;
}

@Injectable()
export class AccountAbstractionService {
  private provider: ethers.Provider;
  private JWT_SECRET = process.env.JWT_SECRET || 'hackathon_qi_tech_secret_2025';
  
  // Simulando banco de dados em memória (em produção, usar DB real)
  private users: Map<string, UserProfile> = new Map();
  private userCredentials: Map<string, { hashedPassword: string; userId: string }> = new Map();

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');

    // Dados de exemplo para desenvolvimento
    this.initializeTestData();
  }

  // 📝 Registrar novo usuário
  async register(registerData: RegisterData): Promise<{ user: UserProfile; token: string; smartAccount: SmartAccountDetails }> {
    try {
      // 1. Verificar se email já existe
      if (this.userCredentials.has(registerData.email)) {
        throw new Error('Email já está em uso');
      }

      // 2. Hash da senha
      const hashedPassword = await bcrypt.hash(registerData.password, 10);

      // 3. Gerar carteira para o usuário
      const wallet = ethers.Wallet.createRandom();
      const eoaAddress = wallet.address;
      const privateKey = wallet.privateKey;

      // 4. Criar Smart Account (simplificado)
      const smartAccountDetails = await this.createSmartAccount(wallet.address, privateKey);

      // 5. Criar perfil do usuário
      const userId = `${registerData.userType}_${Date.now()}`;
      const user: UserProfile = {
        id: userId,
        email: registerData.email,
        userType: registerData.userType,
        smartAccountAddress: smartAccountDetails.smartAccountAddress,
        eoaAddress: eoaAddress,
        privateKey: privateKey, // Apenas para desenvolvimento
        profile: {
          name: registerData.name,
          ...registerData.profile
        },
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // 6. Salvar no "banco de dados"
      this.users.set(userId, user);
      this.userCredentials.set(registerData.email, { 
        hashedPassword, 
        userId 
      });

      // 7. Gerar JWT token
      const token = this.generateJWT(user);

      console.log(`✅ Usuário ${registerData.userType} registrado:`, {
        email: registerData.email,
        smartAccount: smartAccountDetails.smartAccountAddress,
        eoa: eoaAddress
      });

      return { user, token, smartAccount: smartAccountDetails };

    } catch (error) {
      console.error('❌ Erro no registro:', error);
      throw error;
    }
  }

  // 🔐 Login do usuário
  async login(credentials: LoginCredentials): Promise<{ user: UserProfile; token: string; smartAccount: SmartAccountDetails }> {
    try {
      // 1. Verificar credenciais
      const userCred = this.userCredentials.get(credentials.email);
      if (!userCred) {
        throw new Error('Usuário não encontrado');
      }

      const user = this.users.get(userCred.userId);
      if (!user) {
        throw new Error('Perfil do usuário não encontrado');
      }

      // 2. Verificar senha
      const isValidPassword = await bcrypt.compare(credentials.password, userCred.hashedPassword);
      if (!isValidPassword) {
        throw new Error('Senha incorreta');
      }

      // 4. Atualizar último login
      user.lastLogin = new Date();
      this.users.set(user.id, user);

      // 5. Obter detalhes da Smart Account
      const smartAccount = await this.getSmartAccountDetails(user.smartAccountAddress!);

      // 6. Gerar novo token
      const token = this.generateJWT(user);

      console.log(`✅ Login ${user.userType} realizado:`, {
        email: user.email,
        smartAccount: user.smartAccountAddress
      });

      return { user, token, smartAccount };

    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  }

  // 🏦 Criar Smart Account (simplificado para desenvolvimento)
  private async createSmartAccount(eoaAddress: string, privateKey: string): Promise<SmartAccountDetails> {
    try {
      // Por simplicidade, usamos o EOA como Smart Account para desenvolvimento
      // Em produção, implementaria Safe ou outro contrato AA
      
      const balance = await this.provider.getBalance(eoaAddress);
      const nonce = await this.provider.getTransactionCount(eoaAddress);

      return {
        smartAccountAddress: eoaAddress, // Simplificado
        eoaAddress: eoaAddress,
        privateKey: privateKey,
        balance: ethers.formatEther(balance),
        nonce: nonce,
        network: 'Base Sepolia'
      };

    } catch (error) {
      console.error('❌ Erro ao criar Smart Account:', error);
      // Retorna dados padrão se não conseguir consultar a blockchain
      return {
        smartAccountAddress: eoaAddress,
        eoaAddress: eoaAddress,
        privateKey: privateKey,
        balance: '0.0',
        nonce: 0,
        network: 'Base Sepolia'
      };
    }
  }

  // 📊 Obter detalhes da Smart Account
  async getSmartAccountDetails(smartAccountAddress: string): Promise<SmartAccountDetails> {
    try {
      const balance = await this.provider.getBalance(smartAccountAddress);
      const nonce = await this.provider.getTransactionCount(smartAccountAddress);
      
      return {
        smartAccountAddress,
        eoaAddress: smartAccountAddress,
        privateKey: '', // Não retornamos a chave privada aqui
        balance: ethers.formatEther(balance),
        nonce: nonce,
        network: 'Base Sepolia'
      };

    } catch (error) {
      console.error('❌ Erro ao obter detalhes da Smart Account:', error);
      return {
        smartAccountAddress,
        eoaAddress: smartAccountAddress,
        privateKey: '',
        balance: '0.0',
        nonce: 0,
        network: 'Base Sepolia'
      };
    }
  }

  // 🔑 Gerar JWT Token
  private generateJWT(user: UserProfile): string {
    const payload = {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      smartAccountAddress: user.smartAccountAddress,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    };

    return jwt.sign(payload, this.JWT_SECRET);
  }

  // ✅ Verificar JWT Token
  verifyJWT(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // 👤 Obter perfil do usuário
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.users.get(userId) || null;
  }

  // 📝 Atualizar perfil
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }

  // 🎯 Obter usuários por tipo
  async getUsersByType(userType: 'investor' | 'producer'): Promise<UserProfile[]> {
    return Array.from(this.users.values()).filter(user => user.userType === userType);
  }

  // 🔍 Buscar usuário por ID
  async getUserById(userId: string): Promise<UserProfile> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user;
  }

  // 🎫 Extrair usuário do token JWT
  async getUserFromToken(token: string): Promise<UserProfile> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      const user = await this.getUserById(decoded.userId);
      return user;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  // 🧪 Dados de teste para desenvolvimento
  private async initializeTestData() {
    try {
      // Investidor de exemplo
      await this.register({
        email: 'investor@agrofi.com',
        password: '123456',
        userType: 'investor',
        name: 'João Silva',
        profile: {
          investmentStrategy: 'Diversificado',
          riskTolerance: 'medium',
          totalInvested: 50000
        }
      });

      // Produtor de exemplo
      await this.register({
        email: 'producer@agrofi.com',
        password: '123456',
        userType: 'producer',
        name: 'Maria Santos',
        profile: {
          farmName: 'Fazenda Boa Vista',
          location: 'Sorriso, MT',
          cropTypes: ['soja', 'milho'],
          farmSize: 500
        }
      });

      console.log('✅ Dados de teste inicializados');
    } catch (error) {
      console.log('⚠️ Dados de teste já existem');
    }
  }
}