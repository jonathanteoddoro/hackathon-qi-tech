import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sprout, Upload, ArrowLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const NewProposal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: "",
    term: "",
    maxRate: "",
    commodity: "",
    description: "",
  });

  const handleSubmit = () => {
    toast({
      title: "Proposta enviada com sucesso!",
      description: "Sua proposta está sendo analisada e em breve estará disponível para investidores.",
    });
    navigate("/producer/dashboard");
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/producer/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Etapa {step} de {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <Card className="p-8 bg-gradient-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-hero p-3 rounded-lg">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nova Proposta de Crédito</h1>
              <p className="text-muted-foreground">Preencha as informações para captação</p>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="commodity">Commodity</Label>
                <Select
                  value={formData.commodity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, commodity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a commodity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soja">Soja</SelectItem>
                    <SelectItem value="milho">Milho</SelectItem>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="algodao">Algodão</SelectItem>
                    <SelectItem value="cana">Cana-de-açúcar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor Desejado (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="150.000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="term">Prazo (dias)</Label>
                  <Input
                    id="term"
                    type="number"
                    placeholder="180"
                    value={formData.term}
                    onChange={(e) =>
                      setFormData({ ...formData, term: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRate">Taxa Máxima (% a.m.)</Label>
                  <Input
                    id="maxRate"
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formData.maxRate}
                    onChange={(e) =>
                      setFormData({ ...formData, maxRate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Projeto</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva seu projeto, finalidade do crédito e expectativas..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-secondary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Documentos Necessários</h3>
                  <p className="text-sm text-muted-foreground">
                    Para validação da proposta, precisamos de documentos que comprovem
                    sua capacidade de produção e histórico.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Comprovante de Produção</h3>
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload ou arraste o arquivo
                  </p>
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Documentos da Propriedade</h3>
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload ou arraste o arquivo
                  </p>
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Histórico de Crédito (Opcional)</h3>
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload ou arraste o arquivo
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <Card className="p-6 bg-muted/50">
                <h3 className="font-semibold mb-4">Resumo da Proposta</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commodity</span>
                    <span className="font-medium capitalize">{formData.commodity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Solicitado</span>
                    <span className="font-medium">
                      R$ {Number(formData.amount).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prazo</span>
                    <span className="font-medium">{formData.term} dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa Máxima</span>
                    <span className="font-medium">{formData.maxRate}% a.m.</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Estimativas
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LTV Estimado</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score de Crédito</span>
                    <span className="font-medium text-success">850 - Excelente</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tempo de Captação Estimado</span>
                    <span className="font-medium">5-7 dias</span>
                  </div>
                </div>
              </Card>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <p className="text-sm">
                  Ao enviar esta proposta, você concorda com os{" "}
                  <a href="#" className="text-primary hover:underline">
                    termos de uso
                  </a>{" "}
                  e autoriza a tokenização da sua produção como garantia.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Voltar
              </Button>
            )}
            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1">
                Próximo
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex-1">
                Enviar Proposta
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NewProposal;
