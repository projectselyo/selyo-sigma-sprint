import * as Web3 from '@solana/web3.js';
import {
  Metaplex,
  keypairIdentity,
  irysStorage,
} from '@metaplex-foundation/js';
import { importDefaultSigner } from './wallet';

export const createMetaplexInstance = (
  adminWalletSecret: string,
  rpcUrl: string,
) => {
  const connection = new Web3.Connection(rpcUrl);
  const signer = importDefaultSigner(adminWalletSecret);

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(signer))
    .use(
      irysStorage({
        // TODO: update this on prod
        address: 'https://devnet.bundlr.network',
        providerUrl: rpcUrl,
        timeout: 60000,
      }),
    );
  return metaplex;
};
