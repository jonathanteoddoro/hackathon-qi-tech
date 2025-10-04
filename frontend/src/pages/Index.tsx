import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sprout, TrendingUp, Shield, Zap, Users, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
              <Sprout className="h-8 w-8" />
              <span className="text-2xl font-bold">AgroCredit</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Crédito Agrícola que Conecta
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Marketplace P2P revolucionário. Produtores obtêm financiamento justo,
              investidores encontram oportunidades reais no agronegócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="text-lg px-8 bg-white text-primary hover:bg-white/90"
              >
                Começar Agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-white text-white hover:bg-white/10"
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center bg-gradient-card hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-primary mb-2">R$ 50M+</div>
              <div className="text-muted-foreground">Volume Financiado</div>
            </Card>
            <Card className="p-8 text-center bg-gradient-card hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-secondary mb-2">12%</div>
              <div className="text-muted-foreground">Retorno Médio Anual</div>
            </Card>
            <Card className="p-8 text-center bg-gradient-card hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-accent mb-2">2.500+</div>
              <div className="text-muted-foreground">Usuários Ativos</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia blockchain e inteligência artificial simplificando o crédito rural
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 bg-gradient-card hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Sprout className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Para Produtores</h3>
              <p className="text-muted-foreground">
                Acesse crédito rápido com taxas justas. Tokenize sua produção como garantia
                e obtenha financiamento em dias.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-card hover:shadow-lg transition-shadow">
              <div className="bg-secondary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Para Investidores</h3>
              <p className="text-muted-foreground">
                Invista no agronegócio com transparência. Diversifique seu portfólio
                com retornos acima do mercado.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-card hover:shadow-lg transition-shadow">
              <div className="bg-accent/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Segurança Blockchain</h3>
              <p className="text-muted-foreground">
                Smart contracts garantem execução automática. Garantias tokenizadas
                e transparência total nas operações.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-card hover:shadow-lg transition-shadow">
              <div className="bg-success/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-3">Processo Rápido</h3>
              <p className="text-muted-foreground">
                KYC automatizado com ML. Da proposta ao financiamento em menos
                de 7 dias úteis.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-card hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Comunidade Ativa</h3>
              <p className="text-muted-foreground">
                Conecte-se com produtores e investidores. Compartilhe experiências
                e cresça junto.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-card hover:shadow-lg transition-shadow">
              <div className="bg-secondary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Taxas Competitivas</h3>
              <p className="text-muted-foreground">
                Eliminamos intermediários. Taxas mais baixas para produtores,
                retornos maiores para investidores.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-6">
              Pronto para Transformar o Crédito Rural?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Junte-se a milhares de produtores e investidores que já estão
              revolucionando o agronegócio.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="text-lg px-12 bg-white text-primary hover:bg-white/90"
            >
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">AgroCredit</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 AgroCredit. Marketplace P2P de Crédito Agrícola.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
