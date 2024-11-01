import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimestampModule } from './timestamp/timestamp.module';
import { ConfigModule } from '@nestjs/config';
import { BoothModule } from './booth/booth.module';
import config from './config/config';
import { DatabaseModule } from './database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { LoginModule } from './login/login.module';
import { DeviceModule } from './device/device.module';
import { UsersModule } from './users/users.module';
import { MetadataModule } from './metadata/metadata.module';
import { VoteModule } from './vote/vote.module';
import { PaymentModule } from './payment/payment.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'secrete_key', //for trial still not in env
    }),
    TimestampModule,
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    BoothModule,
    LoginModule,
    DatabaseModule,
    DeviceModule,
    UsersModule,
    MetadataModule,
    VoteModule,
    PaymentModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
