import { Injectable } from '@nestjs/common';
import { Proposal, Investment } from '../entities/proposal.entity';

export interface RepaymentSchedule {
  proposalId: string;
  totalAmount: number;
  principal: number;
  interest: number;
  dueDate: Date;
  installments: RepaymentInstallment[];
}

export interface RepaymentInstallment {
  id: string;
  proposalId: string;
  installmentNumber: number;
  amount: number;
  principal: number;
  interest: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export interface RepaymentTransaction {
  id: string;
  proposalId: string;
  amount: number;
  method: 'PIX' | 'BANK_TRANSFER' | 'CRYPTO';
  paidAt: Date;
  txHash?: string;
}

@Injectable()
export class RepaymentService {
  private repaymentSchedules: RepaymentSchedule[] = [];
  private transactions: RepaymentTransaction[] = [];

  // Calcula cronograma de pagamento
  calculateRepaymentSchedule(proposal: Proposal, annualInterestRate: number): RepaymentSchedule {
    const principal = proposal.fundedAmount;
    const months = proposal.term;
    const monthlyRate = annualInterestRate / 100 / 12;
    
    // Juros compostos
    const totalInterest = principal * Math.pow(1 + monthlyRate, months) - principal;
    const totalAmount = principal + totalInterest;
    
    const monthlyPayment = totalAmount / months;

    const installments: RepaymentInstallment[] = [];
    const startDate = new Date();

    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);

      const installment: RepaymentInstallment = {
        id: `inst_${proposal.id}_${i}`,
        proposalId: proposal.id,
        installmentNumber: i,
        amount: monthlyPayment,
        principal: principal / months, // Simplificado - seria amortização decrescente
        interest: totalInterest / months,
        dueDate,
        status: 'PENDING'
      };

      installments.push(installment);
    }

    const schedule: RepaymentSchedule = {
      proposalId: proposal.id,
      totalAmount,
      principal,
      interest: totalInterest,
      dueDate: installments[installments.length - 1].dueDate,
      installments
    };

    this.repaymentSchedules.push(schedule);
    return schedule;
  }

  // Processa pagamento
  processPayment(proposalId: string, amount: number, method: 'PIX' | 'BANK_TRANSFER' | 'CRYPTO'): {
    success: boolean;
    message: string;
    transaction?: RepaymentTransaction;
    remainingBalance: number;
  } {
    const schedule = this.repaymentSchedules.find(s => s.proposalId === proposalId);
    if (!schedule) {
      return { success: false, message: 'Cronograma de pagamento não encontrado', remainingBalance: 0 };
    }

    // Registra transação
    const transaction: RepaymentTransaction = {
      id: `tx_${Date.now()}`,
      proposalId,
      amount,
      method,
      paidAt: new Date(),
      txHash: method === 'CRYPTO' ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined
    };

    this.transactions.push(transaction);

    // Aplica pagamento nas parcelas pendentes
    let remainingAmount = amount;
    const pendingInstallments = schedule.installments
      .filter(inst => inst.status === 'PENDING')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    for (const installment of pendingInstallments) {
      if (remainingAmount >= installment.amount) {
        installment.status = 'PAID';
        installment.paidDate = new Date();
        remainingAmount -= installment.amount;
      } else if (remainingAmount > 0) {
        // Pagamento parcial - por simplicidade, vamos considerar como pendente
        break;
      }
    }

    const totalPaid = this.getTotalPaid(proposalId);
    const remainingBalance = schedule.totalAmount - totalPaid;

    return {
      success: true,
      message: remainingBalance <= 0 ? 'Empréstimo quitado completamente!' : `Pagamento processado. Saldo restante: R$ ${remainingBalance.toFixed(2)}`,
      transaction,
      remainingBalance: Math.max(0, remainingBalance)
    };
  }

  // Calcula total pago
  getTotalPaid(proposalId: string): number {
    return this.transactions
      .filter(tx => tx.proposalId === proposalId)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  // Obtém cronograma de pagamento
  getRepaymentSchedule(proposalId: string): RepaymentSchedule | null {
    return this.repaymentSchedules.find(s => s.proposalId === proposalId) || null;
  }

  // Lista próximos vencimentos
  getUpcomingDueDates(days: number = 30): RepaymentInstallment[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return this.repaymentSchedules
      .flatMap(schedule => schedule.installments)
      .filter(inst => 
        inst.status === 'PENDING' && 
        inst.dueDate <= cutoffDate
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  // Identifica parcelas em atraso
  getOverdueInstallments(): RepaymentInstallment[] {
    const today = new Date();
    
    return this.repaymentSchedules
      .flatMap(schedule => schedule.installments)
      .filter(inst => {
        if (inst.status !== 'PENDING') return false;
        return inst.dueDate < today;
      })
      .map(inst => {
        inst.status = 'OVERDUE';
        return inst;
      });
  }

  // Histórico de pagamentos
  getPaymentHistory(proposalId: string): RepaymentTransaction[] {
    return this.transactions
      .filter(tx => tx.proposalId === proposalId)
      .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime());
  }

  // Relatório de inadimplência
  getDefaultReport(): {
    totalOverdue: number;
    overdueAmount: number;
    overdueProposals: string[];
    averageDaysLate: number;
  } {
    const overdueInstallments = this.getOverdueInstallments();
    const totalOverdue = overdueInstallments.length;
    const overdueAmount = overdueInstallments.reduce((sum, inst) => sum + inst.amount, 0);
    const overdueProposals = [...new Set(overdueInstallments.map(inst => inst.proposalId))];
    
    const today = new Date();
    const daysLate = overdueInstallments.map(inst => 
      Math.floor((today.getTime() - inst.dueDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const averageDaysLate = daysLate.length > 0 
      ? daysLate.reduce((sum, days) => sum + days, 0) / daysLate.length 
      : 0;

    return {
      totalOverdue,
      overdueAmount,
      overdueProposals,
      averageDaysLate
    };
  }
}