import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ProposalEntity } from './proposal-db.entity';

@Entity('investments')
export class InvestmentEntity {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ name: 'proposal_id', length: 50 })
  proposalId: string;

  @Column({ name: 'investor_id', type: 'uuid', nullable: true })
  investorId: string;

  @Column({ name: 'investor_name', length: 255 })
  investorName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'expected_return', type: 'decimal', precision: 5, scale: 2 })
  expectedReturn: number;

  @CreateDateColumn({ name: 'invested_at' })
  investedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'investor_id' })
  investor: UserEntity;

  @ManyToOne(() => ProposalEntity)
  @JoinColumn({ name: 'proposal_id' })
  proposal: ProposalEntity;
}