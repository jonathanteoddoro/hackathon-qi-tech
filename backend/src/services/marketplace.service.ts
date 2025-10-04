import { Injectable } from '@nestjs/common';
import { AccountAbstractionService } from './account-abstraction.service';
import { MorphoOnChainService } from './morpho-onchain.service';
import { ethers } from 'ethers';

export interface LoanRequest {
  id: string;
  producerId: string;
  requestedAmount: number;
  termMonths: number;
  maxInterestRate: number;
  collateralAmount: number;
  collateralType: string;
  warehouseLocation: string;
  warehouseCertificate: string;
  status: 'open' | 'funding' | 'funded' | 'active' | 'completed';
  currentFunding: number;
  createdAt: Date;
  expiresAt: Date;
  marketId: string;
  investors: {
    userId: string;
    amount: number;
    transactionHash: string;
    investedAt: Date;
  }[];
}

export interface CreateLoanRequestDto {
  requestedAmount: number;
  termMonths: number;
  maxInterestRate: number;
  collateralAmount: number;
  collateralType: string;
  warehouseLocation: string;
  warehouseCertificate: string;
  producerToken: string; // JWT token do produtor
}

export interface InvestInLoanDto {
  loanId: string;
  investmentAmount: number;
  investorToken: string; // JWT token do investidor
}

@Injectable()
export class MarketplaceService {
  private loanRequests = new Map<string, LoanRequest>();

  constructor(
    private aaService: AccountAbstractionService,
    private morphoService: MorphoOnChainService
  ) {
    // Criar alguns empréstimos de exemplo para demonstração
    this.createSampleLoans();
  }

  private createSampleLoans() {
    const sampleLoans: LoanRequest[] = [
      {
        id: 'loan_001',
        producerId: 'producer_1759589215031', // Carlos Fazendeiro criado anteriormente
        requestedAmount: 150000,
        termMonths: 6,
        maxInterestRate: 8.5,
        collateralAmount: 500,
        collateralType: 'soja',
        warehouseLocation: 'Armazém Cargill - Sorriso',
        warehouseCertificate: 'CDA-001234',
        status: 'open',
        currentFunding: 0,
        createdAt: new Date('2025-10-01'),
        expiresAt: new Date('2025-10-15'),
        marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        investors: []
      },
      {
        id: 'loan_002',
        producerId: 'producer_1759589215031',
        requestedAmount: 80000,
        termMonths: 4,
        maxInterestRate: 9.0,
        collateralAmount: 300,
        collateralType: 'milho',
        warehouseLocation: 'Cooperativa Lucas Verde',
        warehouseCertificate: 'CDA-001235',
        status: 'funding',
        currentFunding: 25000,
        createdAt: new Date('2025-09-28'),
        expiresAt: new Date('2025-10-12'),
        marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        investors: [
          {
            userId: 'investor_1759589135390', // João Investidor criado anteriormente
            amount: 25000,
            transactionHash: '0x123...',
            investedAt: new Date('2025-10-02')
          }
        ]
      }
    ];

    sampleLoans.forEach(loan => {
      this.loanRequests.set(loan.id, loan);
    });

    console.log('📋 Empréstimos de exemplo criados:', sampleLoans.length);
  }

  // 📋 Listar todas as solicitações de empréstimo
  async getAllLoanRequests(): Promise<LoanRequest[]> {
    const loans = Array.from(this.loanRequests.values());
    
    // Adicionar dados do produtor
    const loansWithProducerData = await Promise.all(
      loans.map(async (loan) => {
        try {
          const producer = await this.aaService.getUserById(loan.producerId);
          return {
            ...loan,
            producer: {
              id: producer.id,
              name: producer.profile.name,
              location: producer.profile.farmName ? `${producer.profile.farmName}, ${producer.profile.location}` : producer.profile.location,
              farmName: producer.profile.farmName,
              riskScore: 'A', // TODO: Implementar scoring real
              reputation: 4.8 // TODO: Implementar sistema de reputação
            }
          };
        } catch (error) {
          console.error('Erro ao buscar dados do produtor:', error);
          return {
            ...loan,
            producer: {
              id: loan.producerId,
              name: 'Produtor não encontrado',
              location: 'N/A',
              farmName: 'N/A',
              riskScore: 'C',
              reputation: 0
            }
          };
        }
      })
    );

    return loansWithProducerData;
  }

  // ➕ Criar nova solicitação de empréstimo
  async createLoanRequest(data: CreateLoanRequestDto): Promise<LoanRequest> {
    // 1. Validar token do produtor
    const producer = await this.aaService.getUserFromToken(data.producerToken);
    if (producer.userType !== 'producer') {
      throw new Error('Apenas produtores podem criar solicitações de empréstimo');
    }

    // 2. Criar nova solicitação
    const loanId = `loan_${Date.now()}`;
    const loan: LoanRequest = {
      id: loanId,
      producerId: producer.id,
      requestedAmount: data.requestedAmount,
      termMonths: data.termMonths,
      maxInterestRate: data.maxInterestRate,
      collateralAmount: data.collateralAmount,
      collateralType: data.collateralType,
      warehouseLocation: data.warehouseLocation,
      warehouseCertificate: data.warehouseCertificate,
      status: 'open',
      currentFunding: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41', // Market ID fixo para demo
      investors: []
    };

    this.loanRequests.set(loanId, loan);

    console.log('✅ Nova solicitação de empréstimo criada:', {
      id: loanId,
      producer: producer.profile.name,
      amount: data.requestedAmount
    });

    return loan;
  }

  // 💰 Investir em empréstimo (transação real na blockchain)
  async investInLoan(data: InvestInLoanDto): Promise<{ 
    success: boolean; 
    transactionHash?: string; 
    error?: string; 
    updatedLoan?: LoanRequest;
  }> {
    try {
      // 1. Validar token do investidor
      const investor = await this.aaService.getUserFromToken(data.investorToken);
      if (investor.userType !== 'investor') {
        throw new Error('Apenas investidores podem investir em empréstimos');
      }

      // 2. Buscar empréstimo
      const loan = this.loanRequests.get(data.loanId);
      if (!loan) {
        throw new Error('Empréstimo não encontrado');
      }

      if (loan.status !== 'open' && loan.status !== 'funding') {
        throw new Error('Este empréstimo não está disponível para investimento');
      }

      // 3. Validar valor do investimento
      const remainingAmount = loan.requestedAmount - loan.currentFunding;
      if (data.investmentAmount > remainingAmount) {
        throw new Error(`Valor excede o necessário. Restam R$ ${remainingAmount.toLocaleString()}`);
      }

      // 4. Validar Smart Account do investidor
      if (!investor.smartAccountAddress) {
        throw new Error('Smart Account não encontrada para este usuário');
      }

      // 5. Verificar se temos a chave privada do investidor (apenas para desenvolvimento)
      if (!investor.privateKey) {
        throw new Error('Chave privada não encontrada para transações blockchain');
      }

      // 6. Criar transação real na blockchain
      console.log('🚀 Criando investimento onchain:', {
        investor: investor.profile.name,
        amount: data.investmentAmount,
        loan: loan.id,
        smartAccount: investor.smartAccountAddress
      });

      const morphoResult = await this.morphoService.createMorphoLoan({
        collateralAmount: ethers.parseEther(data.investmentAmount.toString()).toString(),
        borrowAmount: ethers.parseEther((data.investmentAmount * 0.8).toString()).toString(), // 80% LTV
        userAddress: investor.smartAccountAddress,
        userPrivateKey: investor.privateKey, // Usar a chave privada do usuário diretamente
        marketId: loan.marketId
      });

      if (!morphoResult.success) {
        throw new Error(morphoResult.error || 'Falha na transação blockchain');
      }

      // 7. Atualizar empréstimo
      loan.currentFunding += data.investmentAmount;
      loan.investors.push({
        userId: investor.id,
        amount: data.investmentAmount,
        transactionHash: morphoResult.transactionHash!,
        investedAt: new Date()
      });

      // 8. Verificar se foi totalmente financiado
      if (loan.currentFunding >= loan.requestedAmount) {
        loan.status = 'funded';
      } else if (loan.currentFunding > 0) {
        loan.status = 'funding';
      }

      this.loanRequests.set(loan.id, loan);

      console.log('✅ Investimento realizado com sucesso:', {
        transactionHash: morphoResult.transactionHash,
        investor: investor.profile.name,
        amount: data.investmentAmount,
        totalFunding: loan.currentFunding,
        status: loan.status
      });

      return {
        success: true,
        transactionHash: morphoResult.transactionHash,
        updatedLoan: loan
      };

    } catch (error) {
      console.error('❌ Erro no investimento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // 📊 Buscar empréstimos de um produtor específico
  async getProducerLoans(producerId: string): Promise<LoanRequest[]> {
    const loans = Array.from(this.loanRequests.values())
      .filter(loan => loan.producerId === producerId);
    return loans;
  }

  // 📈 Buscar investimentos de um investidor específico
  async getInvestorInvestments(investorId: string): Promise<{
    loanId: string;
    amount: number;
    transactionHash: string;
    investedAt: Date;
    loanStatus: string;
    producerName: string;
  }[]> {
    const investments: any[] = [];
    
    for (const loan of this.loanRequests.values()) {
      const investment = loan.investors.find(inv => inv.userId === investorId);
      if (investment) {
        try {
          const producer = await this.aaService.getUserById(loan.producerId);
          investments.push({
            loanId: loan.id,
            amount: investment.amount,
            transactionHash: investment.transactionHash,
            investedAt: investment.investedAt,
            loanStatus: loan.status,
            producerName: producer.profile.name
          });
        } catch (error) {
          console.error('Erro ao buscar produtor:', error);
        }
      }
    }

    return investments;
  }

  // 🔍 Buscar empréstimo por ID
  async getLoanById(loanId: string): Promise<LoanRequest | null> {
    return this.loanRequests.get(loanId) || null;
  }
}