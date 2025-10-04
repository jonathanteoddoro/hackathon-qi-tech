import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProposalController } from './controllers/proposal.controller';
import { ProposalService } from './services/proposal.service';
import { RiskService } from './services/risk.service';
import { RepaymentService } from './services/repayment.service';
import { DatabaseService } from './services/database.service';
import { UserEntity } from './entities/user.entity';
import { ProposalEntity } from './entities/proposal-db.entity';
import { InvestmentEntity } from './entities/investment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [UserEntity, ProposalEntity, InvestmentEntity],
        synchronize: false, // Usar migrations em produção
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserEntity, ProposalEntity, InvestmentEntity]),
  ],
  controllers: [AppController, ProposalController],
  providers: [AppService, ProposalService, RiskService, RepaymentService, DatabaseService],
})
export class AppModule {}
