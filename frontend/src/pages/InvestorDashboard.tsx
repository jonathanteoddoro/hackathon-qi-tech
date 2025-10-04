import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Wallet,
  PieChart,
  Shield,
  Bell,
  Search,
  Filter,
  Sprout,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const opportunities = [
    {
      id: 1,
      producer: "Fazenda São José",
      commodity: "Soja",
      amount: 150000,
      funded: 95000,
      rate: 2.1,
      term: 120,
      ltv: 65,
      risk: "baixo",
      location: "MT",
    },
    {
      id: 2,
      producer: "Agrícola Boa Vista",
      commodity: "Café",
      amount: 300000,
      funded: 120000,
      rate: 2.3,
      term: 240,
      ltv: 70,
      risk: "médio",
      location: "MG",
    },
    {
      id: 3,
      producer: "Cooperativa Sul Verde",
      commodity: "Milho",
      amount: 200000,
      funded: 50000,
      rate: 1.9,
      term: 150,
      ltv: 60,
      risk: "baixo",
      location: "PR",
    },
  ];

  const investments = [
    {
      id: 1,
      producer: "Fazenda Santa Clara",
      amount: 50000,
      rate: 2.0,
      term: 180,
      startDate: "01/10/2024",
      returns: 1800,
    },
    {
      id: 2,
      producer: "Agrícola Horizonte",
      amount: 30000,
      rate: 2.2,
      term: 120,
      startDate: "15/11/2024",
      returns: 1320,
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "baixo":
        return "bg-success text-success-foreground";
      case "médio":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-destructive text-destructive-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-secondary p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AgroCredit</h1>
              <p className="text-xs text-muted-foreground">Painel do Investidor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Portfolio Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Saldo Disponível</span>
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              R$ {(125000).toLocaleString("pt-BR")}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Investido</span>
              <PieChart className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              R$ {(80000).toLocaleString("pt-BR")}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Retorno Acumulado</span>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-success">
              R$ {(3120).toLocaleString("pt-BR")}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Retorno Médio</span>
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div className="text-3xl font-bold text-foreground">12.5%</div>
            <p className="text-xs text-muted-foreground mt-1">a.a.</p>
          </Card>
        </div>

        {/* Active Investments */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Meus Investimentos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {investments.map((investment) => (
              <Card key={investment.id} className="p-6 bg-gradient-card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{investment.producer}</h3>
                    <p className="text-sm text-muted-foreground">
                      Início: {investment.startDate}
                    </p>
                  </div>
                  <Badge className="bg-success text-success-foreground">Ativo</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Investido</span>
                    <span className="font-semibold">
                      R$ {investment.amount.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taxa</span>
                    <span className="font-semibold">{investment.rate}% a.m.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Prazo</span>
                    <span className="font-semibold">{investment.term} dias</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">Retorno Acumulado</span>
                    <span className="font-semibold text-success">
                      +R$ {investment.returns.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  Ver Detalhes
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Investment Opportunities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Oportunidades de Investimento</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar oportunidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {opportunities.map((opp) => (
              <Card key={opp.id} className="p-6 hover:shadow-lg transition-shadow bg-gradient-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Sprout className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{opp.producer}</h3>
                      <p className="text-sm text-muted-foreground">
                        {opp.commodity} | {opp.location}
                      </p>
                    </div>
                  </div>
                  <Badge className={getRiskColor(opp.risk)}>
                    Risco {opp.risk}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Captado: R$ {opp.funded.toLocaleString("pt-BR")}
                      </span>
                      <span className="font-medium">
                        {Math.round((opp.funded / opp.amount) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(opp.funded / opp.amount) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Retorno</p>
                      <p className="font-bold text-success">{opp.rate}%</p>
                      <p className="text-xs text-muted-foreground">a.m.</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prazo</p>
                      <p className="font-semibold">{opp.term}</p>
                      <p className="text-xs text-muted-foreground">dias</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LTV</p>
                      <p className="font-semibold">{opp.ltv}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Disponível</p>
                      <p className="font-semibold">
                        R$ {(opp.amount - opp.funded).toLocaleString("pt-BR", {
                          maximumFractionDigits: 0
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1">Investir Agora</Button>
                  <Button variant="outline" className="flex-1">
                    Ver Detalhes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
