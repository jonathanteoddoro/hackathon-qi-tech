import { Controller, Post, Get, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { UserManagementService } from '../services/user-management.service';

@Controller('api/auth-v2')
export class AuthV2Controller {
  constructor(private readonly userService: UserManagementService) {}

  @Post('register')
  async register(@Body() registerData: {
    email: string;
    password: string;
    userType: 'investor' | 'producer';
    profile: any;
  }) {
    try {
      console.log('🚀 [AUTH] Registro iniciado:', registerData.email);
      
      const result = await this.userService.register(registerData);
      
      return {
        success: true,
        message: `${registerData.userType} registrado com sucesso`,
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
          smartAccount: {
            smartAccountAddress: result.user.smartAccountAddress,
            eoaAddress: result.user.eoaAddress,
            privateKey: result.user.privateKey,
            balance: '0.0',
            nonce: 0,
            network: 'Ethereum Sepolia'
          },
          token: result.token
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [AUTH] Erro no registro:', error);
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro interno do servidor',
          timestamp: new Date().toISOString()
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('login')
  async login(@Body() loginData: {
    email: string;
    password: string;
  }) {
    try {
      console.log('🔐 [AUTH] Login iniciado:', loginData.email);
      
      const result = await this.userService.login(loginData.email, loginData.password);
      
      return {
        success: true,
        message: 'Login realizado com sucesso',
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
          smartAccount: {
            smartAccountAddress: result.user.smartAccountAddress,
            eoaAddress: result.user.eoaAddress,
            privateKey: '',
            balance: '0.0',
            nonce: 0,
            network: 'Ethereum Sepolia'
          },
          token: result.token
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [AUTH] Erro no login:', error);
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro de autenticação',
          timestamp: new Date().toISOString()
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  @Get('profile')
  async getProfile(@Headers('authorization') authHeader: string) {
    try {
      console.log('👤 [AUTH] Solicitação de perfil iniciada');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token não fornecido');
      }

      const token = authHeader.split(' ')[1];
      console.log('🎫 [AUTH] Token extraído:', token.substring(0, 20) + '...');

      const user = await this.userService.getUserFromToken(token);

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
      console.error('❌ [AUTH] Erro ao obter perfil:', error);
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter perfil',
          timestamp: new Date().toISOString()
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}