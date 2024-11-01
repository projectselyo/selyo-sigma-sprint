import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';

export const createKeyPairFromSecretString = (secret: string) => {
  return Keypair.fromSecretKey(bs58.decode(secret));
};
