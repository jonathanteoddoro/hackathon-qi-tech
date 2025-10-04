import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { ProposalEntity } from '../entities/proposal-db.entity';
import { InvestmentEntity } from '../entities/investment.entity';
import { Proposal, Investment } from '../entities/proposal.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProposalEntity)
    private proposalRepository: Repository<ProposalEntity>,
    @InjectRepository(InvestmentEntity)
    private investmentRepository: Repository<InvestmentEntity>,
  ) {}

  // USERS
  async createUser(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findUserByName(name: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { name } });
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // PROPOSALS
  async createProposal(proposalData: Partial<ProposalEntity>): Promise<ProposalEntity> {
    const proposal = this.proposalRepository.create(proposalData);
    return this.proposalRepository.save(proposal);
  }

  async findProposalById(id: string): Promise<ProposalEntity | null> {
    return this.proposalRepository.findOne({ 
      where: { id },
      relations: ['producer']
    });
  }

  async findProposalsByStatus(status: string): Promise<ProposalEntity[]> {
    return this.proposalRepository.find({ 
      where: { status: status as any },
      relations: ['producer']
    });
  }

  async findProposalsByProducer(producerName: string): Promise<ProposalEntity[]> {
    return this.proposalRepository.find({ 
      where: { producerName },
      relations: ['producer']
    });
  }

  async updateProposal(id: string, updateData: Partial<ProposalEntity>): Promise<void> {
    await this.proposalRepository.update(id, updateData);
  }

  async getAllProposals(): Promise<ProposalEntity[]> {
    return this.proposalRepository.find({ relations: ['producer'] });
  }

  // INVESTMENTS
  async createInvestment(investmentData: Partial<InvestmentEntity>): Promise<InvestmentEntity> {
    const investment = this.investmentRepository.create(investmentData);
    return this.investmentRepository.save(investment);
  }

  async findInvestmentsByInvestor(investorName: string): Promise<InvestmentEntity[]> {
    return this.investmentRepository.find({ 
      where: { investorName },
      relations: ['proposal', 'investor']
    });
  }

  async findInvestmentsByProposal(proposalId: string): Promise<InvestmentEntity[]> {
    return this.investmentRepository.find({ 
      where: { proposalId },
      relations: ['proposal', 'investor']
    });
  }

  // UTILITIES
  async getProposalWithInvestments(proposalId: string): Promise<Proposal | null> {
    const proposalEntity = await this.proposalRepository.findOne({ 
      where: { id: proposalId },
      relations: ['producer']
    });

    if (!proposalEntity) return null;

    const investments = await this.findInvestmentsByProposal(proposalId);

    // Converte para o formato do modelo de domínio
    const proposal: Proposal = {
      id: proposalEntity.id,
      producerName: proposalEntity.producerName,
      producerLocation: proposalEntity.producerLocation,
      requestedAmount: +proposalEntity.requestedAmount,
      term: proposalEntity.term,
      maxInterestRate: +proposalEntity.maxInterestRate,
      sojaQuantity: proposalEntity.sojaQuantity,
      sojaPrice: +proposalEntity.sojaPrice,
      ltv: +proposalEntity.ltv,
      riskScore: proposalEntity.riskScore,
      status: proposalEntity.status,
      createdAt: proposalEntity.createdAt,
      fundedAmount: +proposalEntity.fundedAmount,
      investments: investments.map(inv => ({
        id: inv.id,
        investorName: inv.investorName,
        proposalId: inv.proposalId,
        amount: +inv.amount,
        expectedReturn: +inv.expectedReturn,
        investedAt: inv.investedAt
      }))
    };

    return proposal;
  }

  async getAllProposalsWithInvestments(): Promise<Proposal[]> {
    const proposalEntities = await this.proposalRepository.find({ 
      relations: ['producer']
    });

    const proposals: Proposal[] = [];

    for (const entity of proposalEntities) {
      const investments = await this.findInvestmentsByProposal(entity.id);
      
      const proposal: Proposal = {
        id: entity.id,
        producerName: entity.producerName,
        producerLocation: entity.producerLocation,
        requestedAmount: +entity.requestedAmount,
        term: entity.term,
        maxInterestRate: +entity.maxInterestRate,
        sojaQuantity: entity.sojaQuantity,
        sojaPrice: +entity.sojaPrice,
        ltv: +entity.ltv,
        riskScore: entity.riskScore,
        status: entity.status,
        createdAt: entity.createdAt,
        fundedAmount: +entity.fundedAmount,
        investments: investments.map(inv => ({
          id: inv.id,
          investorName: inv.investorName,
          proposalId: inv.proposalId,
          amount: +inv.amount,
          expectedReturn: +inv.expectedReturn,
          investedAt: inv.investedAt
        }))
      };

      proposals.push(proposal);
    }

    return proposals;
  }

  // Método helper para buscar ou criar usuário
  async findOrCreateUser(name: string, userType: 'PRODUCER' | 'INVESTOR', location?: string): Promise<UserEntity> {
    let user = await this.findUserByName(name);
    
    if (!user) {
      user = await this.createUser({
        name,
        userType,
        location,
        email: `${name.toLowerCase().replace(' ', '.')}@email.com`
      });
    }

    return user;
  }
}