import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true, nullable: true })
  email: string;

  @Column({ 
    name: 'user_type',
    type: 'enum', 
    enum: ['PRODUCER', 'INVESTOR']
  })
  userType: 'PRODUCER' | 'INVESTOR';

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ name: 'wallet_address', length: 42, nullable: true })
  walletAddress: string;

  @Column({ name: 'cpf_cnpj', length: 18, nullable: true })
  cpfCnpj: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // @OneToMany(() => ProposalEntity, proposal => proposal.producer)
  // proposals: ProposalEntity[];

  // @OneToMany(() => InvestmentEntity, investment => investment.investor)
  // investments: InvestmentEntity[];
}