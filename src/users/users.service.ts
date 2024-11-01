import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { createReadStream } from 'fs';
import * as csv from 'csv-parser';
import {
  mintNftBasic,
  mintNftToCollection,
  retrieveAssetsByOwner,
} from 'src/booth/nft/nft';
import { ConfigService } from '@nestjs/config';
import { BoothRepository } from 'src/booth/booth.repository';
import { MagicLogin, User } from './users.interface';
import { signMessage, verifySignature } from 'src/utils/signature-verify';
import { GENESIS_NFTS_COLLECTION, getRandomInt } from 'src/utils/genesis-nft';
import { Keypair } from '@solana/web3.js';
import { MetadataService } from 'src/metadata/metadata.service'; // Add this import
import { sendEmail } from 'src/utils/email';
import { sign } from 'crypto';

const NodeCache = require('node-cache');
const crypto = require('crypto');
const bs58 = require('bs58');

@Injectable()
export class UsersService {
  private metadataCache: typeof NodeCache;
  constructor(
    private configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly boothRepository: BoothRepository,
    private readonly metadataService: MetadataService,
  ) {
    this.metadataCache = new NodeCache();
  }
  async getUserByEmail(email: string) {
    return this.usersRepository.getUserByEmail(email);
  }

  async searchUserByEmail(email: string) {
    return await this.usersRepository.searchUserByEmail(email);
  }

  async createUser(createUserDto: CreateUserDto) {
    return this.usersRepository.createUser(createUserDto);
  }

  async nfcTagging(email: string, updates: { uid: string }) {
    return this.usersRepository.nfcTagging(email, updates);
  }

  //uploading csv file and extracting email and name
  async uploadFile(file) {
    const results = [];

    await new Promise((resolve, reject) => {
      createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    const data = results.map((row) => ({
      email: row.email,
      name: row.name,
    }));
    const createdUsers = await this.usersRepository.createNewUsersFromCsv(data);
    return createdUsers;
  }

  softDelete(email: string) {
    return this.usersRepository.softDelete(email);
  }

  async getUserOwningUID(uid: string) {
    return await this.usersRepository.getUserOwningUID(uid);
  }

  async tryGetUserProfile(uidOrEmailOrHandle: string) {
    // this will attempt to
    // 1- uid, 2-email, 3-handle
    return await this.usersRepository.tryGetUserProfile(uidOrEmailOrHandle);
  }

  async getUserProfile(uidOrEmailOrHandle: string) {
    const user = await this.tryGetUserProfile(uidOrEmailOrHandle);
    const wallet = this.configService.get('sol.ADMIN_WALLET_KEY');

    if (user && wallet) {
      const stampCollections =
        await this.boothRepository.findAllBoothStampCollection();
      const collectionKeys = stampCollections.map((sc) => sc.collectionPubkey);

      console.log('collectionKeys', collectionKeys);
      console.log(user);

      const rpcUrl = this.configService.get('sol.RPC_URL.DEVNET');
      const assets = await retrieveAssetsByOwner({
        adminWalletSecret: wallet,
        pubkey: user.publicKey,
        rpcUrl,
      });
      console.log('assets', assets.length);

      const includeThisAsset = [];
      const  items  = assets;
      // loop items; loop groupings
      for (const item of items) {
        const { grouping } = item;
        for (const group of grouping) {
          if (collectionKeys.includes(group.group_value)) {
            // query the metadata uri for the i
            let cachedMetadata = this.metadataCache.get(item.content.json_uri);
            if (!cachedMetadata) {
              const response = await fetch(item.content.json_uri);
              cachedMetadata = await response.json();
              this.metadataCache.set(item.content.json_uri, cachedMetadata);
            }

            includeThisAsset.push({
              id: item.id,
              collectionKey: group.group_value,
              metadata: cachedMetadata,
              // ...item,
              content: undefined,
              grouping: undefined,
              compression: undefined,
              royalty: undefined,
              creators: undefined,
              ownership: undefined,
              supply: undefined,
              mutable: undefined,
              burnt: undefined,
              authorities: undefined,
            });
          }
        }
      }

      return {
        user: {
          ...user,
          id: undefined,
          isDeleted: undefined,
          privateKey: undefined,
        },
        items: includeThisAsset,
      };
    }
    return;
  }

  async updateUser(userId: string, updates: User) {
    return await this.usersRepository.updateUser(userId, updates);
  }

  async verifySignature(params: {
    message: string;
    signature: string;
    pubkey: string;
  }) {
    return verifySignature(params.message, params.signature, params.pubkey);
  }

  async claimGenesisNft(params: {
    message: string;
    signature: string;
    pubkey: string;
  }) {
    const validSignature = verifySignature(
      params.message,
      params.signature,
      params.pubkey,
    );
    if (validSignature) {
      const index = (await getRandomInt(1, 13)) as number;
      const chosenNft = GENESIS_NFTS_COLLECTION[index - 1];
      console.log('choosen', chosenNft);

      // use mainnet to retrieve assets info
      const mainnetRpcUrl = this.configService.get('sol.RPC_URL.MAINNET');
      const wallet = this.configService.get('sol.GENESIS_ADMIN_WALLET');

      const items = await retrieveAssetsByOwner({
        adminWalletSecret: wallet,
        rpcUrl: mainnetRpcUrl,
        pubkey: params.pubkey,
      });

      const genesisNftCollectionKey =
        '452AEobQAEQbZthwVxKGE1yXTFCvPd19s5YWSkj4RdBK';
      const genesisBbgMerkleTree =
        'Ac6aJ53B9ztcBj7AqAiZegrCmQEUv2sazR2A32QJZR4u';

      const genesisNfts = items.filter((i) => {
        const belongsToGenesis = i.grouping.filter(
          (j) => j.group_value === genesisNftCollectionKey,
        );
        return belongsToGenesis.length > 0;
      });
      if (genesisNfts.length === 0) {
        const genesisParams = {
          adminWalletSecret: wallet,
          destinationUser: params.pubkey,
          collectionPubkey: genesisNftCollectionKey,
          collectionName: chosenNft.name,
          collectionMetadataUri: chosenNft.metadata,
          merkleTreePubkey: genesisBbgMerkleTree,
          rpcUrl: mainnetRpcUrl,
        };
        console.log('minting genesis params', genesisParams);
        const tx = await mintNftToCollection(genesisParams);
        return {
          message: 'Mint successful',
          signature: tx,
        };
      }
      return {
        message: 'Already minted',
      };
    }
  }

  async getSignedMessageByUser(message: string, uid: string) {
    const user = await this.getUserOwningUID(uid);

    const signedMessage = signMessage(message, user.privateKey);

    return signedMessage;
  }

  async createFistbumpClaim(uid: string) {
    const timestamp = +new Date();
    const user = await this.getUserOwningUID(uid);
    const pubkey = user.publicKey;

    const payload = {
      timestamp,
      pubkey,
    };
    const signedMessage = signMessage(JSON.stringify(payload), user.privateKey);
    const payloadWithSignature = {
      timestamp,
      pubkey,
      signature: signedMessage,
    };
    // create a code which is a base64 encoded json with the following payload
    const code = Buffer.from(JSON.stringify(payloadWithSignature)).toString(
      'base64',
    );
    return {
      timestamp,
      pubkey,
      signature: signedMessage,
      code,
    };
  }

  async verifyAndClaimFistBump(
    code: string,
    claimerPubkey: string,
    notes: string,
    venue: string,
  ) {
    // code is base64 encoded
    // decode code
    const decoDed = Buffer.from(code, 'base64').toString('utf-8');
    const { timestamp, pubkey, signature } = JSON.parse(decoDed);

    // validate timestamp should be within 10 minutes
    const now = +new Date();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    if (timestamp < tenMinutesAgo) {
      throw new BadRequestException('Timestamp is too old');
    }

    const payload = {
      timestamp,
      pubkey,
    };
    const validSignature = verifySignature(
      JSON.stringify(payload),
      signature,
      pubkey,
    );
    console.log('validSignature', validSignature);

    const rpcUrl = this.configService.get('sol.RPC_URL.DEVNET');
    // TODO: need to pull this from configuration
    const TEMPORARY_MERKLE_TREE_FOR_TEST =
      '2RyXoopf57v2E4bPkv127ibF2dADYwnAncBFfGgqtSkW';

    const potentialId = `${pubkey}-${claimerPubkey}-${timestamp}`;
    console.log('potentialId', potentialId);

    const metadataServer = `https://api.zelyo.quest`;
    const metadataUri = `${metadataServer}/metadata/${potentialId}`;
    // const metadataUri = 'https://gist.githubusercontent.com/kimerran/d7bd1ced506ff5a61ca52044edd2522b/raw/46cc432abf06a7fa0d686a9aa7db41940f76f10f/metadata.json';
    console.log('metadataUri', metadataUri);

    const txSignature = await mintNftBasic({
      adminWalletSecret: this.configService.get('sol.ADMIN_WALLET_KEY'),
      nftName: 'BP2024 SG Fistbump',
      nftSymbol: 'SELYOBUMP',
      metadataUri: metadataUri,
      destinationUser: pubkey,
      merkleTreePubkey: TEMPORARY_MERKLE_TREE_FOR_TEST,
      rpcUrl,
    });

    const txSignature2 = await mintNftBasic({
      adminWalletSecret: this.configService.get('sol.ADMIN_WALLET_KEY'),
      nftName: 'BP2024 SG Fistbump',
      nftSymbol: 'SELYOBUMP',
      metadataUri,
      // 'https://gist.githubusercontent.com/kimerran/b38064933096972d1ff64228cbf50a09/raw/ccf950ca4677337d50fb9cd0aae99254544c00e5/selyo-test-metadata.json',
      destinationUser: claimerPubkey,
      merkleTreePubkey: TEMPORARY_MERKLE_TREE_FOR_TEST,
      rpcUrl,
    });

    const output = await this.metadataService.saveMetadata({
      giver: pubkey,
      claimer: claimerPubkey,
      timestamp,
      notes,
      venue,
    });
    console.log('saveMetadata output', output);
    return { txSignature, txSignature2, metadataUri };
  }

  async getAssetsByPubkey(pubkey: string) {
    const rpcUrl = this.configService.get('sol.RPC_URL.DEVNET');
    const assets = await retrieveAssetsByOwner({
      adminWalletSecret: this.configService.get('sol.ADMIN_WALLET_KEY'),
      rpcUrl,
      pubkey,
    });

    const assetsWithMetadata = assets.map((i) => {
      return {
        id: i.id,
        image: i.content.links['image'],
        metadata: i.content.metadata,
      };
    });

    return assetsWithMetadata;
  }

  async createMagicLogin(emailOrUid: string) {
    let email = emailOrUid;
    if (!emailOrUid.includes('@')) {
      // try query by uid
      const matchingUser =
        await this.usersRepository.getUserOwningUID(emailOrUid);
      if (matchingUser) {
        email = matchingUser.email;
        const newMagicLogin: MagicLogin =
          await this.usersRepository.createMagicLogin(email);
        await this.sendMagicLoginEmail(newMagicLogin);
      }
      throw new BadRequestException('User not found');
    }

    const user = await this.usersRepository.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const newMagicLogin: MagicLogin =
      await this.usersRepository.createMagicLogin(user.email);
    await this.sendMagicLoginEmail(newMagicLogin);
  }

  async sendMagicLoginEmail(magicLogin: MagicLogin) {
    const postmarkApiKey = this.configService.get('email.postmarkApiKey');
    await sendEmail({
      postmarkApiKey,
      email: magicLogin.email,
      subject: 'Login to Selyo',
      code: magicLogin.code,
    });
  }

  async claimMagicLogin(email: string, code: string) {
    const hasClaimed = await this.usersRepository.claimMagicLogin(email, code);

    if (hasClaimed) {
      // todo: return a session code
      const user = await this.usersRepository.getUserByEmail(email);
      const signedMessage = await signMessage(user.email, user.privateKey);
      return {
        session: signedMessage,
      };
    }

    throw new BadRequestException('Bad email or code');
  }

  async createTxPending(email: string, action: string) {
    return await this.usersRepository.createTxPending(email, action);
  }

  async checkTxPending(email: string, action: string) {
    return await this.usersRepository.checkTxPending(email, action);
  }

  async deleteTxPending(email: string, action: string) {
    return await this.usersRepository.deleteTxPending(email, action);
  }

  async getUserByPubkey(pubkey: string) {
    return await this.usersRepository.getUserByPubkey(pubkey)
  }

  async clearAllTxPending() {
    return await this.usersRepository.clearAllTxPending()
  }
}
