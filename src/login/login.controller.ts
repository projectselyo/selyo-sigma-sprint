import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { Credentials } from './login.interface';
import { signUpDTO } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('account')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Get()
  async getAllAccount() {
    return this.loginService.getAllAccount();
  }
  @Get('token')
  async getAllToken() {
    return this.loginService.getAllToken();
  }

  // post for creating account and saving token
  @Post('signup')
  async createAccount(
    @Body() signupData: signUpDTO,
  ): Promise<Credentials | undefined> {
    if (!signupData.email || !signupData.pass) return undefined;
    return this.loginService.createAccount(signupData);
  }

  // post log in
  @Post('login')
  async login(@Body() loginData: LoginDto): Promise<Credentials | undefined> {
    if (!loginData.email || !loginData.pass) return undefined;
    return this.loginService.loginAccount(loginData);
  }
  //put update user
  @Put(':email')
  async update(
    @Param('email') userEmail: string,
    @Body() updates: { email: string },
  ): Promise<Credentials | null> {
    return this.loginService.update(userEmail, updates);
  }

  // delete user
  @Delete(':email')
  async delete(@Param('email') userEmail: string): Promise<void> {
    return this.loginService.delete(userEmail);
  }
}
