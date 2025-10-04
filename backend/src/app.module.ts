import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProposalController } from './controllers/proposal.controller';
import { MorphoController } from './controllers/morpho.controller';
import { MorphoOnchainController } from './controllers/morpho-onchain.controller';
import { AuthController } from './controllers/auth.controller';
import { MarketplaceController } from './controllers/marketplace.controller';
import { WalletController, MorphoOnChainController } from './controllers/wallet.controller';
import { ProposalService } from './services/proposal.service';
import { RiskService } from './services/risk.service';
import { RepaymentService } from './services/repayment.service';
import { DatabaseService } from './services/database.service';
import { MorphoService } from './services/morpho.service';
import { MorphoOnChainService } from './services/morpho-onchain.service';
import { AccountAbstractionService } from './services/account-abstraction.service';
import { MarketplaceService } from './services/marketplace.service';
import { WalletService } from './services/wallet.service';
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
  controllers: [AppController, ProposalController, MorphoController, MorphoOnchainController, AuthController, MarketplaceController, WalletController, MorphoOnChainController],
  providers: [AppService, ProposalService, RiskService, RepaymentService, DatabaseService, MorphoService, MorphoOnChainService, AccountAbstractionService, MarketplaceService, WalletService],
})
export class AppModule {}
