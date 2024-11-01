import { generateSigner, none, publicKey } from '@metaplex-foundation/umi';
import { createTree, mintV1 } from '@metaplex-foundation/mpl-bubblegum';

import { initUmi } from './umi';
import { createMetaplexInstance } from './metaplex';

import { mintToCollectionV1 } from '@metaplex-foundation/mpl-bubblegum';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { PublicKey } from '@solana/web3.js';

import { base10, base58 } from '@metaplex-foundation/umi/serializers';
import { BoothStamp } from '../booth.interface';
import { User } from 'src/users/users.interface';

export async function createBBGMerkleTree(
  adminWalletSecret: string,
  rpcUrl: string,
) {
  const umi = initUmi(adminWalletSecret, rpcUrl);

  const merkleTree = generateSigner(umi);
  console.log('merkleTree pubkey', merkleTree.publicKey);

  const builder = await createTree(umi, {
    merkleTree,
    maxDepth: 14,
    maxBufferSize: 64,
  });
  const signature = await builder.send(umi);
  console.log('signature', signature.toString());
  return { signature, merkleTree: merkleTree.publicKey.toString() };
}

export async function createCollection(params: {
  adminWalletSecret: string;
  collectionMetadataUri: string;
  collectionName: string;
  rpcUrl: string;
}) {
  const metaplex = createMetaplexInstance(
    params.adminWalletSecret,
    params.rpcUrl,
  );
  const { nft } = await metaplex.nfts().create(
    {
      uri: params.collectionMetadataUri,
      name: params.collectionName,
      sellerFeeBasisPoints: 0,
    },
    { commitment: 'finalized' },
  );
  const collectionPublicKey = nft.mint.address.toBase58().toString();
  console.log('collectionPublicKey', collectionPublicKey);
  return collectionPublicKey;
}

export async function mintNftToCollection(params: {
  adminWalletSecret: string;
  destinationUser: string;
  collectionPubkey: string;
  collectionName: string;
  collectionMetadataUri: string;
  merkleTreePubkey: string;
  rpcUrl: string;
}) {
  console.log('mintNftToCollection params', params);
  const leafOwner = fromWeb3JsPublicKey(
    // GEGbYWg5M1K5dMQzMhNmeE79JhmhQ2q8tPbrq6Wuewbk
    new PublicKey(params.destinationUser),
  );
  const merkleTree = fromWeb3JsPublicKey(
    new PublicKey(params.merkleTreePubkey),
  );
  const collectionMint = fromWeb3JsPublicKey(
    new PublicKey(params.collectionPubkey),
  );

  const umi = initUmi(params.adminWalletSecret, params.rpcUrl);
  // bubblegum minting
  const signature = await mintToCollectionV1(umi, {
    leafOwner,
    merkleTree,
    collectionMint,
    metadata: {
      name: params.collectionName,
      uri: params.collectionMetadataUri,
      collection: { key: collectionMint, verified: false },
      sellerFeeBasisPoints: 0,
      creators: [
        { address: umi.identity.publicKey, verified: false, share: 100 },
      ],
    },
  }).send(umi);
  const [txSignature] = base58.deserialize(signature);
  return txSignature;
}

export async function mintNftBasic(params: {
  adminWalletSecret: string;
  destinationUser: string;
  nftName: string;
  nftSymbol: string;
  metadataUri: string;
  merkleTreePubkey: string;
  rpcUrl: string;
}) {
  console.log('mintNftToCollection params', params);
  const leafOwner = fromWeb3JsPublicKey(new PublicKey(params.destinationUser));
  const merkleTree = fromWeb3JsPublicKey(
    new PublicKey(params.merkleTreePubkey),
  );

  const umi = initUmi(params.adminWalletSecret, params.rpcUrl);
  // bubblegum minting
  const signature = await mintV1(umi, {
    leafOwner,
    merkleTree,
    metadata: {
      name: params.nftName,
      uri: params.metadataUri,
      symbol: params.nftSymbol,
      collection: none(),
      sellerFeeBasisPoints: 0,
      creators: [
        { address: umi.identity.publicKey, verified: false, share: 100 },
      ],
    },
  }).send(umi);
  const [txSignature] = base58.deserialize(signature);
  return txSignature;
}

export async function retrieveAssetsByOwner(params: {
  adminWalletSecret: string;
  pubkey: string;
  rpcUrl: string;
}) {
  const umi = initUmi(params.adminWalletSecret, params.rpcUrl);

  let page = 1;
  const allAssets = []

  while (page !== 0) {
    const assets = await umi.rpc.getAssetsByOwner({
      owner: publicKey(params.pubkey),
      limit: 1000,
    });
    allAssets.push(...assets.items)
    if (assets.total !== 1000) {
      page = 0
    } else {
      page++;
    }
  }
  return allAssets;
}

export async function retrieveAssetsByGroup(params: {
  adminWalletSecret: string;
  collectionPubkey: string;
  rpcUrl: string;
}) {
  const umi = initUmi(params.adminWalletSecret, params.rpcUrl);

  let page = 1;
  const allAssets = []
  while (page !== 0) {
    const assets = await umi.rpc.getAssetsByGroup({
      groupKey: 'collection',
      groupValue: params.collectionPubkey,
      limit: 1000,
      page: page
      // owner: publicKey(params.pubkey),
      // limit: 109, //The maximum number of assets to retrieve.
    });
    allAssets.push(...assets.items)
    if (assets.total !== 1000) {
      page = 0
    } else {
      page++;
    }
  }
  return allAssets;
}
