import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Credentials, Token } from './login.interface';
import { DatabaseService } from 'src/database/database.service';
import { uuidv7 } from 'uuidv7';
import { signUpDTO } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LoginRepository {
  constructor(
    private readonly dbService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async getAllAccount(): Promise<Credentials[]> {
    const result = await this.dbService.allCredentials();
    return result as unknown as Credentials[];
  }
  async getActiveAccount(): Promise<Credentials[]> {
    const existingAccount = await this.getAllAccount();
    const getActiveCred = existingAccount.filter(
      (cred) => cred.isDeleted === false,
    );
    return getActiveCred;
  }

  //Generate token
  async generateToken(userId) {
    const acessToken = this.jwtService.sign({ userId }, { expiresIn: '1d' }); //Expires in  after 1day
    const yourUserID = userId;

    await this.storeToken(acessToken, yourUserID);
    console.log(acessToken);
    return {
      acessToken,
      yourUserID,
    };
  }

  //saving token to a separate db
  async storeToken(token: string, userId): Promise<Token> {
    const savingToken: Token = {
      token: token,
      userId: userId,
    };
    await this.dbService.saveToken(savingToken);
    return savingToken;
  }

  //getting all the access token
  async getAllToken(): Promise<Token[]> {
    const result = await this.dbService.getAllToken();
    return result as unknown as Token[];
  }

  //creating account and saving token
  async createAccount(signupData: signUpDTO): Promise<Credentials> | undefined {
    // check if email exis
    const allCredentials = await this.getActiveAccount();
    const existingAccount = allCredentials.find(
      (cred) => cred.email === signupData.email,
    );

    if (existingAccount) {
      throw new BadRequestException('Email already taken');
    }

    // if email not found create new account
    const newAccount: Credentials = {
      id: uuidv7(),
      email: signupData.email ?? '',
      password: signupData.pass ?? '',
      isDeleted: false,
    };

    // Save the new account
    await this.dbService.saveCredentials(newAccount);
    return newAccount;
  }

  //log in
  async loginAccount(loginData: LoginDto): Promise<Credentials> {
    //check if email exist
    const allCredentials = await this.getAllAccount();
    const existingAccount = allCredentials.find(
      (cred) =>
        cred.email === loginData.email && cred.password === loginData.pass,
    );
    //check if password is correct
    if (!existingAccount) {
      throw new UnauthorizedException('Wrong Email or Password');
    }

    //generate JWT
    const userId = existingAccount.id;
    this.generateToken(userId);

    return existingAccount;
  }

  //put update user
  async update(
    userEmail: string,
    updates: { email: string },
  ): Promise<Credentials | null> {
    const allCredentials = await this.getAllAccount();
    const getEmail = allCredentials.find((email) => email.email === userEmail);
    // Find existing user by email
    if (!getEmail) {
      throw new NotFoundException('User not found');
    }
    // Update the record if it is existing
    await this.dbService.updateCredentials(userEmail, updates);
    return;
  }

  //soft delete user
  async delete(userEmail: string): Promise<void> {
    try {
      // Update the record to mark it as deleted
      await this.dbService.softDelete(userEmail);
      console.log(`Record with email ${userEmail} marked as deleted.`);
    } catch (error) {
      console.error('Error performing soft delete:', error);
    }
  }
}
