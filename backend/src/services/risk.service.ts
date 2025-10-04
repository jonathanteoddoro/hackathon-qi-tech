import { Injectable } from '@nestjs/common';
import { Proposal } from '../entities/proposal.entity';

export interface RiskAlert {
  id: string;
  proposalId: string;
  type: 'LTV_HIGH' | 'PRICE_DROP' | 'LIQUIDATION_WARNING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  createdAt: Date;
  resolved: boolean;
}

@Injectable()
export class RiskService {
  private alerts: RiskAlert[] = [];

  // Calcula health factor (margem de segurança)
  calculateHealthFactor(proposal: Proposal): number {
    // Health factor = (Collateral Value / Loan Value)
    // Valor abaixo de 1.2 é considerado risco alto
    const collateralValue = proposal.sojaQuantity * proposal.sojaPrice;
    const loanValue = proposal.fundedAmount;
    
    if (loanValue === 0) return 999; // Sem empréstimo ativo
    
    return collateralValue / loanValue;
  }

  // Avalia risco de uma proposta
  assessProposalRisk(proposal: Proposal): {
    healthFactor: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendations: string[];
  } {
    const healthFactor = this.calculateHealthFactor(proposal);
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    const recommendations: string[] = [];

    if (healthFactor >= 1.5) {
      riskLevel = 'LOW';
    } else if (healthFactor >= 1.3) {
      riskLevel = 'MEDIUM';
      recommendations.push('Monitorar preços da soja de perto');
    } else if (healthFactor >= 1.1) {
      riskLevel = 'HIGH';
      recommendations.push('Considerar adicionar mais garantia');
      recommendations.push('Reduzir exposição se possível');
    } else {
      riskLevel = 'CRITICAL';
      recommendations.push('URGENTE: Risco de liquidação iminente');
      recommendations.push('Adicionar garantia imediatamente ou quitar empréstimo');
    }

    // Análise adicional baseada no LTV
    if (proposal.ltv > 80) {
      recommendations.push('LTV alto - considerar reduzir valor do empréstimo');
    }

    return { healthFactor, riskLevel, recommendations };
  }

  // Cria alerta de risco
  createAlert(proposalId: string, type: RiskAlert['type'], severity: RiskAlert['severity'], message: string): RiskAlert {
    const alert: RiskAlert = {
      id: `alert_${Date.now()}`,
      proposalId,
      type,
      severity,
      message,
      createdAt: new Date(),
      resolved: false
    };

    this.alerts.push(alert);
    return alert;
  }

  // Monitora todas as propostas ativas e gera alertas
  monitorActiveProposals(proposals: Proposal[]): RiskAlert[] {
    const newAlerts: RiskAlert[] = [];

    proposals
      .filter(p => p.status === 'FUNDED' || p.status === 'ACTIVE')
      .forEach(proposal => {
        const risk = this.assessProposalRisk(proposal);

        // Alerta de LTV alto
        if (risk.riskLevel === 'CRITICAL') {
          const alert = this.createAlert(
            proposal.id,
            'LIQUIDATION_WARNING',
            'CRITICAL',
            `Proposta ${proposal.producerName} com health factor ${risk.healthFactor.toFixed(2)} - risco de liquidação`
          );
          newAlerts.push(alert);
        } else if (risk.riskLevel === 'HIGH') {
          const alert = this.createAlert(
            proposal.id,
            'LTV_HIGH',
            'HIGH',
            `Proposta ${proposal.producerName} com health factor ${risk.healthFactor.toFixed(2)} - monitorar de perto`
          );
          newAlerts.push(alert);
        }
      });

    return newAlerts;
  }

  // Lista alertas ativos
  getActiveAlerts(): RiskAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Resolve um alerta
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  // Estatísticas de risco do portfolio
  getPortfolioRiskStats(proposals: Proposal[]): {
    totalExposure: number;
    averageHealthFactor: number;
    riskDistribution: { [key: string]: number };
    criticalProposals: number;
  } {
    const activeProposals = proposals.filter(p => p.status === 'FUNDED' || p.status === 'ACTIVE');
    
    const totalExposure = activeProposals.reduce((sum, p) => sum + p.fundedAmount, 0);
    
    const healthFactors = activeProposals.map(p => this.calculateHealthFactor(p));
    const averageHealthFactor = healthFactors.length > 0 
      ? healthFactors.reduce((sum, hf) => sum + hf, 0) / healthFactors.length 
      : 0;

    const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    let criticalProposals = 0;

    activeProposals.forEach(proposal => {
      const risk = this.assessProposalRisk(proposal);
      riskDistribution[risk.riskLevel]++;
      if (risk.riskLevel === 'CRITICAL') criticalProposals++;
    });

    return {
      totalExposure,
      averageHealthFactor,
      riskDistribution,
      criticalProposals
    };
  }
}