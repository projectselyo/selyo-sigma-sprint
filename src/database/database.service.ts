import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Booth, BoothStamp } from 'src/booth/booth.interface';
import { Credentials, Token } from 'src/login/login.interface';
import { DeviceInfo } from 'src/device/device.interface';
import { Timestamp } from 'src/timestamp/timestamp.interface';
import { MagicLogin, TxPending, User } from 'src/users/users.interface';
import SurrealDB, { RecordId } from 'surrealdb';
import {
  BOOTHSTAMP_TABLE_NAME,
  TIMESTAMP_TABLE_NAME,
  CREDENTIALS_TABLE_NAME,
  TOKEN_TABLE_NAME,
  DEVICE_TABLE_NAME,
  USERS_TABLE_NAME,
  BOOTH_TABLE_NAME,
  BOOTHSTAMP_COLLECTION_TABLE_NAME,
  METADATA_TABLE_NAME,
  POLL_TABLE_NAME,
  MAGIC_LOGIN_TABLE_NAME,
  TX_PENDING_TABLE_NAME,
} from './database.constants';
import { Metadata } from 'src/metadata/metadata.interface';
import { Poll, PollOption } from 'src/vote/vote.interface';
import { v4 as uuidv4 } from 'uuid';

const NodeCache = require( "node-cache" );

@Injectable()
export class DatabaseService {
  private client: SurrealDB;
  private dbCache;

  constructor(private configService: ConfigService) {
    this.client = new SurrealDB();
    this.connect();
    this.dbCache = new NodeCache({
      stdTTL: 300
    });
  }

  //connection setup
  async connect() {
    try {
      await this.client.connect(this.configService.get('database.URL'), {
        namespace: this.configService.get('database.NAMESPACE'),
        database: this.configService.get('database.DATABASE'),
        auth: this.configService.get('database.AUTH'),
      });
      console.log('Connected to SurrealDB successfully.');
    } catch (error) {
      console.error('Error connecting to SurrealDB:', error);
      throw error;
    }
  }

  //timestamp
  async createTimestamp(entity: Timestamp) {
    return await this.client.create<Timestamp>(TIMESTAMP_TABLE_NAME, entity);
  }
  async findAllTimestamp() {
    return await this.client.select(TIMESTAMP_TABLE_NAME);
  }

  //login credentials
  async saveCredentials(entity: Credentials) {
    return await this.client.create<Credentials>(
      CREDENTIALS_TABLE_NAME,
      entity,
    );
  }
  async allCredentials() {
    return await this.client.select(CREDENTIALS_TABLE_NAME);
  }

  async updateCredentials(email: string, updates: { email: string }) {
    try {
      const newEmail = updates.email;
      const getAllEmail = await this.allCredentials();
      const checkEmail = getAllEmail.find((email) => email.email === newEmail);
      console.log(newEmail);

      if (!checkEmail) {
        // // Query to update the email field
        const updateQuery = `UPDATE ${CREDENTIALS_TABLE_NAME} SET email = '${newEmail}' WHERE email = '${email}'`;
        const updateResult = await this.client.query(updateQuery);
        console.log('Update query result:', updateResult);
      } else {
        throw new BadRequestException('Email Already Take');
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
    }
  }
  async softDelete(userEmail: string) {
    const updateQuery = `UPDATE ${CREDENTIALS_TABLE_NAME} SET isDeleted = true WHERE email = '${userEmail}'`;
    const updateResult = await this.client.query(updateQuery);
    console.log('Update query result:', updateResult);
    return updateResult;
  }

  //Token
  async saveToken(entity: Token) {
    return await this.client.create<Token>(TOKEN_TABLE_NAME, entity);
  }
  async getAllToken() {
    return await this.client.select(TOKEN_TABLE_NAME);
  }

  // booths
  async createBooth(entity: Booth) {
    const record = await this.client.create<Booth>(BOOTH_TABLE_NAME, entity);
    return record.shift();
  }

  async findAllBooth() {
    const record = await this.client.select<Booth>(BOOTH_TABLE_NAME);
    return record;
  }

  async findBoothById(boothId: string) {
    const matchingBooth = await this.client.query<Booth[][]>(
      `SELECT * FROM ${BOOTH_TABLE_NAME} WHERE id = booth:${boothId}`,
    );
    return matchingBooth[0].shift();
  }

  //stamp collection
  async createBoothStampCollection(entity: BoothStamp) {
    return await this.client.create<BoothStamp>(
      BOOTHSTAMP_COLLECTION_TABLE_NAME,
      entity,
    );
  }

  async getBoothStampCollectionByBoothId(boothId: string) {
    console.log(boothId);
    const match = await this.client.query<BoothStamp[][]>(
      `SELECT * FROM ${BOOTHSTAMP_COLLECTION_TABLE_NAME} WHERE boothId = '${boothId}'`,
    );
    console.log('getBoothStampCollectionByBoothId atch', match);
    return match[0].shift();
  }

  async findAllBoothStampCollection() {
    return await this.client.select<BoothStamp>(
      BOOTHSTAMP_COLLECTION_TABLE_NAME,
    );
  }

  //Devices
  async saveDevice(entity: DeviceInfo) {
    return await this.client.create<DeviceInfo>(DEVICE_TABLE_NAME, entity);
  }
  async deviceSoftDelete(deviceName: string) {
    const updateQuery = `UPDATE ${DEVICE_TABLE_NAME} SET isDeleted = true WHERE deviceName = '${deviceName}'`;
    const updateResult = await this.client.query(updateQuery);
    console.log('Update query result:', updateResult);
    return updateResult;
  }
  async getAllDeviceInfo() {
    return this.client.select(DEVICE_TABLE_NAME);
  }

  async getDeviceById(deviceId: string) {
    const matchingDevice = await this.client.query<DeviceInfo[][]>(
      `SELECT * FROM ${DEVICE_TABLE_NAME} WHERE deviceId = $deviceId`,
      {
        deviceId,
      },
    );
    return matchingDevice[0].shift();
  }

  async updateDevice(deviceId: string, updatedFields: Record<string, any>) {
    try {
      const getAllDevice = await this.getAllDeviceInfo();
      const matchingDevice = getAllDevice.find(
        (device) => device.deviceId === deviceId,
      );

      if (matchingDevice) {
        const mergeResult = await this.client.merge(
          matchingDevice.id,
          updatedFields,
        );

        return mergeResult;
      }
      throw new BadRequestException('Name Already Take');
    } catch (error) {
      console.error('Error updating DeviceInfo:', error);
    }
  }

  //create new users
  async saveNewUser(entity: User) {
    return await this.client.create<User>(USERS_TABLE_NAME, entity);
  }

  async getAllUsers() {
    const allUsersAcached = this.dbCache.get('users')
    if (allUsersAcached) {
      console.log('getAllUsers cache hit!')
      return allUsersAcached
    }
    const results = await this.client.select<User>(USERS_TABLE_NAME);
    this.dbCache.set('users', results);
    return results;
  }

  async getUserByEmail(email: string) {
    const matchingEmail = await this.client.query<User[][]>(
      `SELECT * FROM ${USERS_TABLE_NAME} WHERE email = $email`,
      {
        email,
      },
    );
    return matchingEmail[0].shift();
  }

  async searchByEmail(email: string) {
    // TODO: surrealdb doesnt implement LIKE queries
    const matches = await this.client.query_raw<User[][]>(
      `SELECT * FROM ${USERS_TABLE_NAME} WHERE email LIKE $email`,
      {
        email: `${email}%`,
      },
    );
    return matches[0].result as User[];
  }

  async getUserByPubkey(pubkey: string) {
    const matches = await this.client.query_raw<User[][]>(
      `SELECT * FROM ${USERS_TABLE_NAME} WHERE publicKey = $pubkey`,
      {
        pubkey: `${pubkey}`,
      },
    );
    return (matches[0].result as User[]).shift();
  }

  async usersSoftDelete(email: string) {
    const updateQuery = `UPDATE ${USERS_TABLE_NAME} SET isDeleted = true WHERE email = '${email}'`;
    const updateResult = await this.client.query(updateQuery);
    console.log('Update query result:', updateResult);
    return updateResult;
  }

  async tryGetUserProfile(uidOrEmailOrHandle: string) {
    const matches = await this.client.query_raw<User[][]>(
      `SELECT * FROM ${USERS_TABLE_NAME} WHERE email = $uidOrEmailOrHandle OR uid = $uidOrEmailOrHandle OR handle = $uidOrEmailOrHandle;`,
      {
        uidOrEmailOrHandle: `${uidOrEmailOrHandle}`,
      },
    );

    return (matches[0].result as User[]).shift();
  }

  async nfcTagging(email: string, updates: { uid: string }) {
    try {
      const uid = updates.uid;

      // // Query to update the email field
      const updateQuery = `UPDATE ${USERS_TABLE_NAME} SET uid = '${uid}' WHERE email = '${email}'`;
      const updateResult = await this.client.query(updateQuery);
      console.log('Update query result:', updateResult);

      return updateResult;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getUserOwningUID(uid: string) {
    const matchingUser = await this.client.query<User[][]>(
      `SELECT * FROM ${USERS_TABLE_NAME} WHERE uid = $uid`,
      {
        uid: uid.toUpperCase(),
      },
    );
    return matchingUser[0].shift();
  }

  async updateUser(userId: string, updatedFields: Record<string, any>) {
    try {
      const id = new RecordId(USERS_TABLE_NAME, userId);
      const updates = await this.client.merge<User>(id, updatedFields);
      return updates;
    } catch (error) {
      console.error('Error updating DeviceInfo:', error);
    }
  }

  async saveNewMetadata(entity: Metadata) {
    return await this.client.create<Metadata>(METADATA_TABLE_NAME, entity);
  }

  async getMetadataById2(id2: string) {
    const matchingMetadata = await this.client.query<Metadata[][]>(
      `SELECT * FROM ${METADATA_TABLE_NAME} WHERE id2 = $id2`,
      {
        id2,
      },
    );
    return matchingMetadata[0].shift();
  }

  async createPoll(poll: Poll) {
    const newPoll = {
      ...poll
    };
    return await this.client.create(POLL_TABLE_NAME, newPoll);
  }

  async getAllPolls() {
    return this.client.select<Poll>(POLL_TABLE_NAME);
  }

  async getPoll(pollId: string) {
    const matchingPoll = await this.client.query<Poll[][]>(
      `SELECT * FROM ${POLL_TABLE_NAME} WHERE id = poll:${pollId}`,
      {
        pollId,
      }
    );
    return matchingPoll[0].shift();
  }

  async getPollByHandle(pollHandle: string) {
    const matchingPoll = await this.client.query<Poll[][]>(
      `SELECT * FROM ${POLL_TABLE_NAME} WHERE handle = $pollHandle`,
      {
        pollHandle,
      }
    );
    return matchingPoll[0].shift();
  }

  async createMagicLogin(email: string) {
    const newMagicLogin = {
      email,
      code: uuidv4(),
      isClaimed: false,
    };
    await this.client.create(MAGIC_LOGIN_TABLE_NAME, newMagicLogin);
    return newMagicLogin;
  }

  async getAndVerify(email: string, code: string) {
    const matchingMagicLogin = await this.client.query<MagicLogin[][]>(
      `SELECT * FROM ${MAGIC_LOGIN_TABLE_NAME}
        WHERE email = $email AND code = $code AND isClaimed = false`,
      {
        email,
        code,
      },
    );
    const hasMatch = matchingMagicLogin[0].shift();
    if (hasMatch) {
      // update
      await this.client.merge(hasMatch.id, { isClaimed: true });
      return true;
    }

    return false;
  }

  async createTxPending(email: string, action: string) {
    await this.client.create(TX_PENDING_TABLE_NAME, {
      email,
      action,
    });
  }

  async clearAllTxPending() {
    await this.client.delete(TX_PENDING_TABLE_NAME);
  }

  async checkTxPending(email: string, action: string) {
    const txPendingMatch = await this.client.query<TxPending[][]>(
      `SELECT * FROM ${TX_PENDING_TABLE_NAME}
        WHERE email = $email AND action = $action`,
      {
        email,
        action,
      },
    );
    return txPendingMatch[0].shift() !== undefined;
  }

  async deleteTxPending(email: string, action: string) {
    const txPendingMatch = await this.client.query<TxPending[][]>(
      `SELECT * FROM ${TX_PENDING_TABLE_NAME}
        WHERE email = $email AND action = $action`,
      {
        email,
        action,
      },
    );
    const toDelete = txPendingMatch[0].shift();
    await this.client.delete(toDelete.id);
  }
}
