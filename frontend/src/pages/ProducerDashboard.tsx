import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sprout,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProducerDashboard = () => {
  const navigate = useNavigate();
  const [notifications] = useState([
    { id: 1, text: "Nova proposta totalmente financiada!", type: "success" },
    { id: 2, text: "Pagamento próximo em 5 dias", type: "warning" },
  ]);

  const proposals = [
    {
      id: 1,
      amount: 250000,
      funded: 250000,
      investors: 12,
      rate: 1.8,
      status: "funded",
      commodity: "Soja",
      term: 180,
    },
    {
      id: 2,
      amount: 150000,
      funded: 95000,
      investors: 7,
      rate: 2.1,
      status: "funding",
      commodity: "Milho",
      term: 120,
    },
    {
      id: 3,
      amount: 300000,
      funded: 0,
      investors: 0,
      rate: 1.9,
      status: "pending",
      commodity: "Café",
      term: 240,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "funded":
        return "bg-success text-success-foreground";
      case "funding":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "funded":
        return "Financiado";
      case "funding":
        return "Em Captação";
      default:
        return "Aguardando";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-hero p-2 rounded-lg">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AgroCredit</h1>
              <p className="text-xs text-muted-foreground">Painel do Produtor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Alerts */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`p-4 flex items-center gap-3 ${
                  notif.type === "success"
                    ? "border-success bg-success/5"
                    : "border-warning bg-warning/5"
                }`}
              >
                {notif.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
                <p className="text-sm font-medium">{notif.text}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Score de Crédito</span>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-success">850</div>
            <Progress value={85} className="mt-2" />
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Financiado</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              R$ {(345000).toLocaleString("pt-BR")}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Propostas Ativas</span>
              <FileText className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-foreground">3</div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">LTV Médio</span>
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div className="text-3xl font-bold text-foreground">65%</div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => navigate("/producer/new-proposal")}
          >
            <Plus className="h-5 w-5" />
            Nova Proposta
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <FileText className="h-5 w-5" />
            Meus Documentos
          </Button>
        </div>

        {/* Proposals List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Minhas Propostas</h2>
          <div className="grid gap-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="p-6 hover:shadow-lg transition-shadow bg-gradient-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Sprout className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        Financiamento - {proposal.commodity}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Prazo: {proposal.term} dias | Taxa: {proposal.rate}% a.m.
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(proposal.status)}>
                    {getStatusText(proposal.status)}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Financiado: R$ {proposal.funded.toLocaleString("pt-BR")}
                      </span>
                      <span className="font-medium">
                        {Math.round((proposal.funded / proposal.amount) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(proposal.funded / proposal.amount) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor Solicitado</p>
                      <p className="font-semibold">
                        R$ {proposal.amount.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Investidores</p>
                      <p className="font-semibold">{proposal.investors}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <div className="flex items-center gap-1">
                        {proposal.status === "funded" ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <Clock className="h-4 w-4 text-warning" />
                        )}
                        <p className="font-semibold text-sm">
                          {getStatusText(proposal.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  Ver Detalhes
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerDashboard;
