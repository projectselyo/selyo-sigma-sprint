import { Injectable } from '@nestjs/common';
import { Credentials } from './login.interface';
import { LoginRepository } from './login.repository';
import { signUpDTO } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LoginService {
  constructor(private readonly loginRepository: LoginRepository) {}
  // post for creating account and saving token
  async createAccount(signupData: signUpDTO): Promise<Credentials> {
    return this.loginRepository.createAccount(signupData);
  }

  async getAllAccount() {
    return this.loginRepository.getActiveAccount();
  }
  async getAllToken() {
    return this.loginRepository.getAllToken();
  }

  // post log in
  async loginAccount(loginData: LoginDto): Promise<Credentials> {
    return this.loginRepository.loginAccount(loginData);
  }

  //put update user
  async update(
    userEmail: string,
    updates: { email: string },
  ): Promise<Credentials | null> {
    return this.loginRepository.update(userEmail, updates);
  }
  //delete user
  async delete(userEmail: string): Promise<void> {
    return this.loginRepository.delete(userEmail);
  }
}
