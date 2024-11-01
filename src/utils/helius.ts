import { Helius } from 'helius-sdk';
const helius = new Helius('f556a42b-78d5-40bf-a1a6-c52ab0d91e9e', 'devnet');

export async function getAssetsByOwner(pubkey: string) {
  const response = await helius.rpc.getAssetsByOwner({
    ownerAddress: pubkey,
    page: 1,
    limit: 1000,
  });
  return response.items;
}


export async function getAssetsByCollection(collectionPubkey: string) {
  const helius = new Helius('f556a42b-78d5-40bf-a1a6-c52ab0d91e9e', 'devnet');

  console.log('collectionPubkey', collectionPubkey)
  const response = await helius.rpc.getAssetsByGroup({
    groupValue: 'collection',
    groupKey: collectionPubkey,
    page: 1,
    limit: 1000,
    displayOptions: {
      showUnverifiedCollections: true,
    }
  });
  console.log(response)
  return response;
}