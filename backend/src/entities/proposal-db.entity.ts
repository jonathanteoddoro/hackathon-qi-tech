import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('proposals')
export class ProposalEntity {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ name: 'producer_id', type: 'uuid', nullable: true })
  producerId: string;

  @Column({ name: 'producer_name', length: 255 })
  producerName: string;

  @Column({ name: 'producer_location', length: 255, nullable: true })
  producerLocation: string;

  @Column({ name: 'requested_amount', type: 'decimal', precision: 15, scale: 2 })
  requestedAmount: number;

  @Column({ name: 'funded_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  fundedAmount: number;

  @Column({ type: 'integer' })
  term: number;

  @Column({ name: 'max_interest_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxInterestRate: number;

  @Column({ name: 'soja_quantity', type: 'integer' })
  sojaQuantity: number;

  @Column({ name: 'soja_price', type: 'decimal', precision: 10, scale: 2 })
  sojaPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  ltv: number;

  @Column({ 
    name: 'risk_score',
    type: 'enum',
    enum: ['A', 'B', 'C']
  })
  riskScore: 'A' | 'B' | 'C';

  @Column({ 
    type: 'enum',
    enum: ['PENDING', 'FUNDED', 'ACTIVE', 'REPAID', 'LIQUIDATED'],
    default: 'PENDING'
  })
  status: 'PENDING' | 'FUNDED' | 'ACTIVE' | 'REPAID' | 'LIQUIDATED';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'producer_id' })
  producer: UserEntity;

  // investments: InvestmentEntity[]; // Adicionar depois
}