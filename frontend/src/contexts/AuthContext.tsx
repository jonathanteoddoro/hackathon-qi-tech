import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/auth-api';
import type { User, LoginRequest, RegisterRequest } from '../services/auth-api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Função para validar e normalizar dados do usuário
function validateAndNormalizeUser(userData: any): User | null {
  if (!userData || typeof userData !== 'object') {
    return null;
  }

  // Verificar propriedades obrigatórias
  const requiredFields = ['id', 'email', 'userType', 'smartAccountAddress'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      console.warn(`Campo obrigatório ausente: ${field}`);
      return null;
    }
  }

  // Normalizar dados do usuário
  return {
    id: userData.id,
    email: userData.email,
    name: userData.name || 'Usuário',
    userType: userData.userType,
    smartAccountAddress: userData.smartAccountAddress,
    profile: userData.profile || {},
    createdAt: userData.createdAt || new Date().toISOString()
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTokenExpiredNotice, setShowTokenExpiredNotice] = useState(false);

  useEffect(() => {
    // Verificar se há token salvo no localStorage
    const savedToken = localStorage.getItem('agrofi_token');
    if (savedToken) {
      setToken(savedToken);
      loadUserProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserProfile = async (authToken: string) => {
    try {
      setIsLoading(true);
      const userProfile = await authAPI.getProfile(authToken);
      const validatedUser = validateAndNormalizeUser(userProfile);

      if (validatedUser) {
        setUser(validatedUser);
      } else {
        console.error('Dados do usuário inválidos:', userProfile);
        // Dados inválidos, limpar
        localStorage.removeItem('agrofi_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      console.log('🔄 Limpando token inválido (possível reinicialização dos dados)');
      // Token inválido, limpar
      localStorage.removeItem('agrofi_token');
      setToken(null);
      setUser(null);
      setShowTokenExpiredNotice(true);
      
      // Esconder notificação após 5 segundos
      setTimeout(() => setShowTokenExpiredNotice(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);

      const validatedUser = validateAndNormalizeUser(response.user);
      if (validatedUser) {
        setToken(response.token);
        setUser(validatedUser);
        localStorage.setItem('agrofi_token', response.token);
      } else {
        throw new Error('Dados do usuário inválidos recebidos do servidor');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);

      const validatedUser = validateAndNormalizeUser(response.user);
      if (validatedUser) {
        setToken(response.token);
        setUser(validatedUser);
        localStorage.setItem('agrofi_token', response.token);
      } else {
        throw new Error('Dados do usuário inválidos recebidos do servidor');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agrofi_token');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {showTokenExpiredNotice && (
        <div className="fixed top-4 right-4 bg-orange-100 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <div>
              <p className="font-medium">Sessão Expirada</p>
              <p className="text-sm">Por favor, faça login novamente</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}