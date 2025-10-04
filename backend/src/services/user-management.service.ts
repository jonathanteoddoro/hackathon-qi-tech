import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface UserProfile {
  id: string;
  email: string;
  userType: 'investor' | 'producer';
  smartAccountAddress: string;
  eoaAddress: string;
  privateKey: string;
  profile: {
    name: string;
    location?: string;
    farmName?: string;
    cropTypes?: string[];
    investmentStrategy?: string;
    riskTolerance?: 'low' | 'medium' | 'high';
  };
  createdAt: Date;
  lastLogin: Date;
}

interface UserCredentials {
  hashedPassword: string;
  userId: string;
}

@Injectable()
export class UserManagementService {
  private users = new Map<string, UserProfile>();
  private userCredentials = new Map<string, UserCredentials>();
  private readonly JWT_SECRET = 'agrofi-super-secret-key-2025';
  private readonly JWT_EXPIRES_IN = '24h';

  constructor() {
    console.log('🏗️ UserManagementService inicializado');
    this.initializeTestUsers();
  }

  // 📝 Registrar novo usuário
  async register(data: {
    email: string;
    password: string;
    userType: 'investor' | 'producer';
    profile: any;
  }): Promise<{ user: UserProfile; token: string }> {
    try {
      console.log('📝 Registrando usuário:', data.email, data.userType);

      // 1. Verificar se email já existe
      if (this.userCredentials.has(data.email)) {
        throw new Error('Email já está em uso');
      }

      // 2. Hash da senha
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // 3. Gerar carteira
      const wallet = ethers.Wallet.createRandom();

      // 4. Criar perfil do usuário
      const userId = `${data.userType}_${Date.now()}`;
      const user: UserProfile = {
        id: userId,
        email: data.email,
        userType: data.userType,
        smartAccountAddress: wallet.address,
        eoaAddress: wallet.address,
        privateKey: wallet.privateKey,
        profile: {
          name: data.profile.name,
          location: data.profile.location,
          ...data.profile
        },
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // 5. Salvar usuário
      this.users.set(userId, user);
      this.userCredentials.set(data.email, { hashedPassword, userId });

      // 6. Gerar token
      const token = this.generateJWT(user);

      console.log('✅ Usuário registrado:', userId);
      console.log('👥 Total de usuários:', this.users.size);

      return { user, token };
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      throw error;
    }
  }

  // 🔐 Login
  async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    try {
      console.log('🔐 Tentativa de login:', email);

      // 1. Verificar se usuário existe
      const credentials = this.userCredentials.get(email);
      if (!credentials) {
        throw new Error('Email não encontrado');
      }

      // 2. Verificar senha
      const isValidPassword = await bcrypt.compare(password, credentials.hashedPassword);
      if (!isValidPassword) {
        throw new Error('Senha incorreta');
      }

      // 3. Buscar usuário
      const user = this.users.get(credentials.userId);
      if (!user) {
        throw new Error('Dados do usuário corrompidos');
      }

      // 4. Atualizar último login
      user.lastLogin = new Date();
      this.users.set(user.id, user);

      // 5. Gerar token
      const token = this.generateJWT(user);

      console.log('✅ Login realizado:', user.id);
      return { user, token };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  }

  // 🎫 Validar token e obter usuário
  async getUserFromToken(token: string): Promise<UserProfile> {
    try {
      console.log('🎫 Validando token:', token.substring(0, 20) + '...');

      // 1. Verificar e decodificar token
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      console.log('📋 Token decodificado para usuário:', decoded.userId);

      // 2. Buscar usuário
      const user = this.users.get(decoded.userId);
      if (!user) {
        console.error('❌ Usuário do token não encontrado:', decoded.userId);
        console.log('👥 Usuários disponíveis:', Array.from(this.users.keys()));
        throw new Error('TOKEN_USER_NOT_FOUND');
      }

      console.log('✅ Usuário validado via token:', user.id);
      return user;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        console.error('❌ JWT inválido - assinatura incorreta:', error.message);
        throw new Error('TOKEN_INVALID_SIGNATURE');
      } else if (error.name === 'TokenExpiredError') {
        console.error('❌ JWT expirado:', error.message);
        throw new Error('TOKEN_EXPIRED');
      } else if (error.message === 'TOKEN_USER_NOT_FOUND') {
        throw error;
      } else {
        console.error('❌ Erro na validação do token:', error);
        throw new Error('TOKEN_VALIDATION_ERROR');
      }
    }
  }

  // 🔍 Buscar usuário por ID
  async getUserById(userId: string): Promise<UserProfile> {
    console.log('🔍 Buscando usuário por ID:', userId);
    
    const user = this.users.get(userId);
    if (!user) {
      console.error('❌ Usuário não encontrado:', userId);
      console.log('👥 Usuários disponíveis:', Array.from(this.users.keys()));
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  // 📊 Estatísticas
  getStats() {
    return {
      totalUsers: this.users.size,
      totalCredentials: this.userCredentials.size,
      userIds: Array.from(this.users.keys()),
      emails: Array.from(this.userCredentials.keys())
    };
  }

  // 🔑 Gerar JWT
  private generateJWT(user: UserProfile): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: user.userType,
        smartAccountAddress: user.smartAccountAddress
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  // 🧪 Inicializar usuários de teste
  private async initializeTestUsers() {
    try {
      console.log('🧪 Inicializando usuários de teste...');

      // Investidor padrão
      await this.register({
        email: 'investor@agrofi.com',
        password: '123456',
        userType: 'investor',
        profile: {
          name: 'João Investidor',
          location: 'São Paulo, SP',
          investmentStrategy: 'Conservadora',
          riskTolerance: 'medium'
        }
      });

      // Produtor padrão
      await this.register({
        email: 'producer@agrofi.com',
        password: '123456',
        userType: 'producer',
        profile: {
          name: 'Carlos Fazendeiro',
          location: 'Sorriso, MT',
          farmName: 'Fazenda Esperança',
          cropTypes: ['soja', 'milho']
        }
      });

      console.log('✅ Usuários de teste criados');
      console.log('👥 Total de usuários:', this.users.size);
    } catch (error) {
      console.error('❌ Erro ao criar usuários de teste:', error);
    }
  }
}