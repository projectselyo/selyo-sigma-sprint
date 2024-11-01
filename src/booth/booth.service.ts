import { BadRequestException, Injectable } from '@nestjs/common';
import { BoothRepository } from './booth.repository';
import { Booth, BoothStamp, TimeStampReport } from './booth.interface';
import { ConfigService } from '@nestjs/config';
import {
  createCollection,
  mintNftToCollection,
  retrieveAssetsByGroup,
} from './nft/nft';
import { UsersService } from 'src/users/users.service';
import { getAssetsByCollection, getAssetsByOwner } from 'src/utils/helius';

@Injectable()
export class BoothService {
  constructor(
    private configService: ConfigService,
    private readonly boothRepository: BoothRepository,
    private readonly userService: UsersService,
  ) {
    if (!this.configService.get('sol.ADMIN_WALLET_KEY')) {
      throw new Error('ADMIN_WALLET_KEY should be defined.');
    }
  }

  async findAllBooth() {
    const booths = await this.boothRepository.getAllBooth();
    const retVal: Array<{ booth: Booth; stamp: BoothStamp; minted: number }> =
      [];

    for (const booth of booths) {
      const [, boothIdOnly] = booth.id.toString().split('booth:');
      const stampCollection =
        await this.boothRepository.getBoothStampCollection(boothIdOnly);
      const minted = await this.getAssetsByCollection(boothIdOnly);
      retVal.push({
        booth: booth,
        stamp: stampCollection || undefined,
        minted: minted?.length || 0,
      });
    }
    return retVal;
  }
  async getBoothById(boothId: string) {
    return await this.boothRepository.getBoothById(boothId);
  }

  async mintStampToUser(uid: string, boothId: string) {
    // get user owning the uid
    const user = await this.userService.getUserOwningUID(uid);
    const txPending = await this.userService.checkTxPending(
      user.email,
      'boothstamp',
    );
    if (txPending) {
      throw new BadRequestException('Tx is pending for this action');
    }
    await this.userService.createTxPending(user.email, 'boothstamp');

    const stampCollection =
      await this.boothRepository.getBoothStampCollection(boothId);

    const rpcUrl = this.configService.get('sol.RPC_URL.DEVNET');

    // TODO: need to pull this from configuration
    const TEMPORARY_MERKLE_TREE_FOR_TEST =
      '2RyXoopf57v2E4bPkv127ibF2dADYwnAncBFfGgqtSkW';

    // check if already minted this collection
    const assets = await getAssetsByOwner(user.publicKey);

    const matchie = assets.filter(({ grouping }) => {
      for (const group of grouping) {
        if (group.group_value === stampCollection.collectionPubkey) {
          return true;
        }
      }
    });
    console.log('matchie.lengthj', matchie.length);
    // COMMENT FOR TESTING
    if (matchie.length > 0) {
      await this.userService.deleteTxPending(user.email, 'boothstamp');
      throw new BadRequestException('Avoid duplicate mint!');
    }

    const txSignature = await mintNftToCollection({
      adminWalletSecret: this.configService.get('sol.ADMIN_WALLET_KEY'),
      collectionPubkey: stampCollection.collectionPubkey,
      collectionName: stampCollection.collectionName,
      collectionMetadataUri: stampCollection.collectionMetadataUri,
      destinationUser: user.publicKey,
      merkleTreePubkey: TEMPORARY_MERKLE_TREE_FOR_TEST,
      rpcUrl,
    });
    console.log('txSignature', txSignature);
    await this.userService.deleteTxPending(user.email, 'boothstamp');
    return txSignature;
  }

  async createBooth(booth: Booth) {
    return await this.boothRepository.createBooth(booth);
  }

  async createStampCollection(params: {
    boothId: string;
    metadataUri: string;
    collectioName: string;
  }) {
    const existingCollection =
      await this.boothRepository.getBoothStampCollection(params.boothId);
    if (existingCollection) {
      throw new BadRequestException(
        'We only allow one collection per booth for now',
      );
    }

    console.log({ x: params.collectioName });
    const rpcUrl = this.configService.get('sol.RPC_URL.DEVNET');
    const collectionPubKey = await createCollection({
      adminWalletSecret: this.configService.get('sol.ADMIN_WALLET_KEY'),
      collectionMetadataUri: params.metadataUri,
      collectionName: params.collectioName,
      rpcUrl,
    });

    const retval = await this.boothRepository.createBoothStamp({
      boothId: params.boothId,
      collectionPubkey: collectionPubKey,
      collectionMetadataUri: params.metadataUri,
      collectionName: params.collectioName,
    });
    return retval?.shift();
  }

  async findAllBoothStampCollection() {
    return await this.boothRepository.findAllBoothStampCollection();
  }

  async getAssetsByCollection(boothId: string) {
    const rpcUrl = this.configService.get('sol.RPC_URL.DEVNET');
    const adminWalletSecret = this.configService.get('sol.ADMIN_WALLET_KEY');

    const booth = await this.boothRepository.getBoothStampCollection(boothId);

    if (booth) {
      const assetsByCollection = await retrieveAssetsByGroup({
        adminWalletSecret,
        collectionPubkey: booth.collectionPubkey,
        rpcUrl,
      });

      const mappedAssetsByCollection: Array<string> = [];
      for (const asset of assetsByCollection) {
        const user = await this.userService.getUserByPubkey(
          asset.ownership.owner,
        );
        mappedAssetsByCollection.push(user?.email || 'no@email.com');
      }

      return mappedAssetsByCollection;
    }

    return;
  }

  async questCompletion(boothIds: [string]) {
    const arrays = [];
    let i = 0;
    for (const bId of boothIds) {
      const ownersForBooth = await this.getAssetsByCollection(bId);
      arrays[i] = ownersForBooth;
      i++;
    }
    // get the first
    const y: Array<string> = arrays[0];

    const finalList = [];
    for (const xx of y) {
      const elementToCheck = xx;
      const isElementPresent = arrays.every((arr) =>
        arr.includes(elementToCheck),
      );
      if (isElementPresent) {
        finalList.push(xx);
      }
    }
    // finalList is the email,
    const finalList2 = [];
    for (const userEmail of finalList) {
      const user = await this.userService.getUserByEmail(userEmail)
      finalList2.push(user)
    }
    
    return finalList2.map((l) => {
      return l.name;
    });
  }
}
