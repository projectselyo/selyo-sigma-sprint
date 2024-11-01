import {
  createSignerFromKeypair,
  signerIdentity,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export const importDefaultSigner = (adminWalletSecret: string) => {
  return Keypair.fromSecretKey(bs58.decode(adminWalletSecret));
};

export const initUmi = (adminWalletSecret: string, rpcUrl: string) => {
  const signer = importDefaultSigner(adminWalletSecret);

  const umi = createUmi(rpcUrl, 'finalized');
  const umiSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(signer));
  umi.use(signerIdentity(umiSigner));
  umi.use(mplTokenMetadata());
  umi.use(dasApi());
  return umi;
};
