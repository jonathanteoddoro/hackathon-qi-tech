import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sprout, User, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterRequest, InvestorProfile, ProducerProfile } from '../services/auth-api';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Estados para registro
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    userType: 'investor' as 'investor' | 'producer'
  });

  // Estados para perfil de investidor
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>({
    investmentInterests: [],
    riskTolerance: 'medium',
    preferredTerms: []
  });

  // Estados para perfil de produtor
  const [producerProfile, setProducerProfile] = useState<ProducerProfile>({
    farmName: '',
    location: '',
    cropTypes: [],
    farmSize: 0
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(loginData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const profile = registerData.userType === 'investor' ? investorProfile : producerProfile;
      
      const data: RegisterRequest = {
        ...registerData,
        profile
      };

      await register(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropToggle = (crop: string) => {
    setProducerProfile(prev => ({
      ...prev,
      cropTypes: prev.cropTypes.includes(crop)
        ? prev.cropTypes.filter(c => c !== crop)
        : [...prev.cropTypes, crop]
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setInvestorProfile(prev => ({
      ...prev,
      investmentInterests: prev.investmentInterests.includes(interest)
        ? prev.investmentInterests.filter(i => i !== interest)
        : [...prev.investmentInterests, interest]
    }));
  };

  const handleTermToggle = (term: number) => {
    setInvestorProfile(prev => ({
      ...prev,
      preferredTerms: prev.preferredTerms.includes(term)
        ? prev.preferredTerms.filter(t => t !== term)
        : [...prev.preferredTerms, term]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Sprout className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">AgroFi</h1>
          </div>
          <p className="text-lg text-gray-600">
            Entre ou cadastre-se para acessar o marketplace
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          {/* Login */}
          <TabsContent value="login">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Entrar na conta
                </CardTitle>
                <CardDescription>
                  Acesse sua conta para continuar investindo ou solicitando empréstimos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register */}
          <TabsContent value="register">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Criar conta
                </CardTitle>
                <CardDescription>
                  Registre-se como investidor ou produtor rural
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  
                  {/* Tipo de usuário */}
                  <div className="space-y-3">
                    <Label>Tipo de conta</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={registerData.userType === 'investor' ? 'default' : 'outline'}
                        onClick={() => setRegisterData(prev => ({ ...prev, userType: 'investor' }))}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <TrendingUp className="h-6 w-6" />
                        <span className="text-sm font-medium">Investidor</span>
                      </Button>
                      <Button
                        type="button"
                        variant={registerData.userType === 'producer' ? 'default' : 'outline'}
                        onClick={() => setRegisterData(prev => ({ ...prev, userType: 'producer' }))}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <Sprout className="h-6 w-6" />
                        <span className="text-sm font-medium">Produtor</span>
                      </Button>
                    </div>
                  </div>

                  {/* Dados básicos */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Senha</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Perfil específico - Investidor */}
                  {registerData.userType === 'investor' && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium text-sm text-gray-700">Perfil de Investimento</h4>
                      
                      <div className="space-y-2">
                        <Label>Tolerância ao risco</Label>
                        <div className="flex gap-2">
                          {(['low', 'medium', 'high'] as const).map((risk) => (
                            <Button
                              key={risk}
                              type="button"
                              size="sm"
                              variant={investorProfile.riskTolerance === risk ? 'default' : 'outline'}
                              onClick={() => setInvestorProfile(prev => ({ ...prev, riskTolerance: risk }))}
                            >
                              {risk === 'low' ? 'Baixo' : risk === 'medium' ? 'Médio' : 'Alto'}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Interesses de investimento</Label>
                        <div className="flex flex-wrap gap-2">
                          {['soja', 'milho', 'algodão', 'café', 'cana'].map((interest) => (
                            <Badge
                              key={interest}
                              variant={investorProfile.investmentInterests.includes(interest) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => handleInterestToggle(interest)}
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Prazos preferidos (meses)</Label>
                        <div className="flex flex-wrap gap-2">
                          {[3, 6, 9, 12, 18, 24].map((term) => (
                            <Badge
                              key={term}
                              variant={investorProfile.preferredTerms.includes(term) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => handleTermToggle(term)}
                            >
                              {term}m
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Perfil específico - Produtor */}
                  {registerData.userType === 'producer' && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium text-sm text-gray-700">Dados da Propriedade</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Nome da fazenda</Label>
                        <Input
                          id="farmName"
                          placeholder="Ex: Fazenda Santa Clara"
                          value={producerProfile.farmName}
                          onChange={(e) => setProducerProfile(prev => ({ ...prev, farmName: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Localização</Label>
                        <Input
                          id="location"
                          placeholder="Ex: Sorriso, MT"
                          value={producerProfile.location}
                          onChange={(e) => setProducerProfile(prev => ({ ...prev, location: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="farmSize">Tamanho da propriedade (hectares)</Label>
                        <Input
                          id="farmSize"
                          type="number"
                          placeholder="Ex: 500"
                          value={producerProfile.farmSize || ''}
                          onChange={(e) => setProducerProfile(prev => ({ ...prev, farmSize: Number(e.target.value) }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Culturas produzidas</Label>
                        <div className="flex flex-wrap gap-2">
                          {['soja', 'milho', 'algodão', 'café', 'cana'].map((crop) => (
                            <Badge
                              key={crop}
                              variant={producerProfile.cropTypes.includes(crop) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => handleCropToggle(crop)}
                            >
                              {crop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}