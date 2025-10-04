import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [userType, setUserType] = useState<"producer" | "investor">("producer");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Login realizado com sucesso!",
      description: `Bem-vindo ao AgroCredit`,
    });
    navigate(userType === "producer" ? "/producer/dashboard" : "/investor/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-3 bg-gradient-hero px-6 py-3 rounded-full">
            <Sprout className="h-8 w-8 text-primary-foreground" />
            <h1 className="text-2xl font-bold text-primary-foreground">AgroCredit</h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Conectando o Campo aos Investimentos
          </h2>
          <p className="text-lg text-muted-foreground">
            Marketplace P2P de crédito agrícola. Produtores obtêm financiamento justo,
            investidores encontram oportunidades reais no agronegócio.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Card className="p-4 bg-gradient-card border-primary/20">
              <div className="text-3xl font-bold text-primary">R$ 50M+</div>
              <div className="text-sm text-muted-foreground">Financiado</div>
            </Card>
            <Card className="p-4 bg-gradient-card border-secondary/20">
              <div className="text-3xl font-bold text-secondary">12%</div>
              <div className="text-sm text-muted-foreground">Retorno Médio</div>
            </Card>
          </div>
        </div>

        {/* Login Form */}
        <Card className="p-8 bg-gradient-card shadow-xl">
          <Tabs value={userType} onValueChange={(v) => setUserType(v as "producer" | "investor")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="producer" className="gap-2">
                <Sprout className="h-4 w-4" />
                Produtor
              </TabsTrigger>
              <TabsTrigger value="investor" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Investidor
              </TabsTrigger>
            </TabsList>

            <TabsContent value={userType}>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email ou Telefone</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="seu@email.com ou (00) 00000-0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="João Silva"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document">CPF/CNPJ</Label>
                      <Input
                        id="document"
                        type="text"
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full" size="lg">
                  {isSignUp ? "Criar Conta" : "Entrar"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-primary hover:underline"
                  >
                    {isSignUp ? "Já tem conta? Faça login" : "Não tem conta? Cadastre-se"}
                  </button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="w-full">
                    Google
                  </Button>
                  <Button type="button" variant="outline" className="w-full">
                    Apple ID
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
