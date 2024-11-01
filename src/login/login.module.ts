import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { LoginRepository } from './login.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LoginController],
  providers: [LoginService, LoginRepository],
  exports: [LoginService, LoginRepository],
})
export class LoginModule {}
