import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './users.interface';
import { uuidv7 } from 'uuidv7';
import { DatabaseService } from 'src/database/database.service';
import { Keypair } from '@solana/web3.js';
import base58 from 'bs58';

@Injectable()
export class UsersRepository {
  constructor(private readonly dbService: DatabaseService) { }

  async allUsers(): Promise<User[]> {
    const result = await this.dbService.getAllUsers();
    return result as unknown as User[];
  }

  // get User By Email
  async getUserByEmail(email: string): Promise<User> {
    const result = await this.dbService.getUserByEmail(email);
    return result;
  }

  async searchUserByEmail(email: string) {
    const users = await this.dbService.getAllUsers();

    return users
      .filter((user) => {
        return user?.email.includes(email);
      })
      .slice(0, 49)
      .map((user) => {
        return {
          ...user,
          privateKey: undefined,
        };
      });
  }

  async getUserByPubkey(pubkey: string) {
    return await this.dbService.getUserByPubkey(pubkey)
  }



  async tryGetUserProfile(uidOrEmailOrHandle: string) { 
    return await this.dbService.tryGetUserProfile(uidOrEmailOrHandle);
  }

  // generate keypairs
  async generateKeypair() {
    const keypair = Keypair.generate();

    const publicKey = keypair.publicKey.toBase58();
    const secretKey = keypair.secretKey;
    const secretKeyBs8 = base58.encode(secretKey);

    console.log('PulicKey', publicKey);
    console.log('bs58SecKey', secretKeyBs8);

    return {
      publicKey,
      secretKeyBs8,
    };
  }

  //creating single user
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const keypair = await this.generateKeypair();
    const newUser: User = {
      // id: uuidv7(),
      email: createUserDto.email,
      name: createUserDto.name,
      isDeleted: false,
      uid: null,
      publicKey: keypair.publicKey,
      privateKey: keypair.secretKeyBs8,
    };
    await this.dbService.saveNewUser(newUser);
    console.log(`Email: "${createUserDto.email}" successfully added`);
    return newUser;
  }

  //creating new user from the csv file
  async createNewUsersFromCsv(data: { email: string; name: string }[]) {
    //loop to all emails and names
    const createdUsers: User[] = [];
    for (const newUser of data) {
      if (newUser.email) {
        const existingUser = await this.getUserByEmail(newUser.email);
        if (!existingUser) {
          createdUsers.push(await this.createUser(newUser));
        }
      }
    }
    return createdUsers;
  }

  //bind nfc id to user
  async nfcTagging(email: string, updates: { uid: string }) {
    const existingNfcId = await this.allUsers();
    const checkNfcId = existingNfcId.find((uid) => uid.uid === updates.uid);
    if (checkNfcId) {
      throw new BadRequestException(
        `this NFC ID: ${updates.uid} is already in use`,
      );
    }
    // Update the record to bind the NFC Id to user
    await this.dbService.nfcTagging(email, updates);
    return `this Email: '${email}' successfully bind to ${updates.uid}.`;
  }

  //Delete soft delete only
  async softDelete(email: string): Promise<void> {
    try {
      // Update the record to mark it as deleted
      await this.dbService.usersSoftDelete(email);
      console.log(`Record with Device ${email} marked as deleted.`);
    } catch (error) {
      console.error('Error performing soft delete:', error);
    }
  }

  async getUserOwningUID(uid: string) {
    return await this.dbService.getUserOwningUID(uid);
  }

  async updateUser(userId: string, userUpdates: User) {
    // we will only accept only certain fields to be updated
    const acceptedUpdates = {
      uid: userUpdates.uid.toUpperCase(),
    };
    const updated = await this.dbService.updateUser(userId, acceptedUpdates);
    return {
      ...updated,
      privateKey: undefined,
    };
  }

  async createMagicLogin(email: string) {
    return await this.dbService.createMagicLogin(email);
  }

  async claimMagicLogin(email: string, code: string) {
    return await this.dbService.getAndVerify(email, code);
  }

  async createTxPending(email: string, action: string) {
    return await this.dbService.createTxPending(email, action);
  }

  async checkTxPending(email: string, action: string) {
    return await this.dbService.checkTxPending(email, action);
  }

  async deleteTxPending(email: string, action: string) {
    return await this.dbService.deleteTxPending(email, action);
  }

  async clearAllTxPending() {
    await this.dbService.clearAllTxPending()
  }
}
