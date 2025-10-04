import { Controller, Post, Get, Body, Headers, Param, UseGuards } from '@nestjs/common';
import { AccountAbstractionService, RegisterData, LoginCredentials } from '../services/account-abstraction.service';

export class RegisterDto {
  email: string;
  password: string;
  userType: 'investor' | 'producer';
  name: string;
  profile: any;
}

export class LoginDto {
  email: string;
  password: string;
}

// Middleware simples para verificar JWT
function extractUserId(authHeader: string): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido');
  }
  
  const token = authHeader.split(' ')[1];
  // Implementação simplificada - em produção use JWT decode
  return 'user_id_from_token';
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly aaService: AccountAbstractionService) {}

  // 📝 Registro de usuário
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.aaService.register({
        email: registerDto.email,
        password: registerDto.password,
        userType: registerDto.userType,
        name: registerDto.name,
        profile: registerDto.profile || {}
      });

      return {
        success: true,
        message: `${registerDto.userType} registrado com sucesso`,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            userType: result.user.userType,
            name: result.user.profile.name,
            smartAccountAddress: result.user.smartAccountAddress,
            eoaAddress: result.user.eoaAddress,
            profile: result.user.profile
          },
          smartAccount: result.smartAccount,
          token: result.token
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 🔐 Login de usuário
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.aaService.login({
        email: loginDto.email,
        password: loginDto.password
      });

      return {
        success: true,
        message: `Login realizado com sucesso`,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            userType: result.user.userType,
            name: result.user.profile.name,
            smartAccountAddress: result.user.smartAccountAddress,
            eoaAddress: result.user.eoaAddress,
            profile: result.user.profile,
            lastLogin: result.user.lastLogin
          },
          smartAccount: result.smartAccount,
          token: result.token
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 👤 Obter perfil do usuário autenticado
  @Get('profile')
  async getProfile(@Headers('authorization') authHeader: string) {
    try {
      // Implementação simplificada de autenticação
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token não fornecido');
      }

      const token = authHeader.split(' ')[1];
      const decoded = this.aaService.verifyJWT(token);
      const user = await this.aaService.getUserProfile(decoded.userId);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          userType: user.userType,
          name: user.profile.name,
          smartAccountAddress: user.smartAccountAddress,
          eoaAddress: user.eoaAddress,
          profile: user.profile,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 📊 Smart Account details
  @Get('smart-account')
  async getSmartAccount(@Headers('authorization') authHeader: string) {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token não fornecido');
      }

      const token = authHeader.split(' ')[1];
      const decoded = this.aaService.verifyJWT(token);
      const user = await this.aaService.getUserProfile(decoded.userId);

      if (!user || !user.smartAccountAddress) {
        throw new Error('Smart Account não encontrada');
      }

      const smartAccount = await this.aaService.getSmartAccountDetails(user.smartAccountAddress);

      return {
        success: true,
        data: smartAccount,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 👥 Listar usuários por tipo (para desenvolvimento)
  @Get('users/:userType')
  async getUsersByType(@Param('userType') userType: 'investor' | 'producer') {
    try {
      const users = await this.aaService.getUsersByType(userType);
      
      return {
        success: true,
        data: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.profile.name,
          smartAccountAddress: user.smartAccountAddress,
          profile: user.profile,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        })),
        count: users.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 🧪 Dados de teste - Login rápido
  @Get('test-login/:userType')
  async testLogin(@Param('userType') userType: 'investor' | 'producer') {
    try {
      const email = userType === 'investor' ? 'investor@agrofi.com' : 'producer@agrofi.com';
      
      const result = await this.aaService.login({
        email,
        password: '123456'
      });

      return {
        success: true,
        message: `Login de teste ${userType} realizado`,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            userType: result.user.userType,
            name: result.user.profile.name,
            smartAccountAddress: result.user.smartAccountAddress
          },
          token: result.token
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}