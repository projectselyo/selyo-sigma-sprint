// const minimumBalance = await connection.getMinimumBalanceForRentExemption(
//     0, // note: simple accounts that just store native SOL have `0` bytes of data
//   );
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import bs58 from 'bs58';

export const createKeyPairFromSecretString = (secret: string) => {
  return Keypair.fromSecretKey(bs58.decode(secret));
};

export const generateAccount = async (params: {
  adminWalletSecret: string;
  rpcUrl: string;
}) => {
  const newKeyPair = Keypair.generate();
  const adminSigner = createKeyPairFromSecretString(params.adminWalletSecret);

  const connection = new Connection(params.rpcUrl);

  const minimumBalance = await connection.getMinimumBalanceForRentExemption(
    0, // note: simple accounts that just store native SOL have `0` bytes of data
  );
  const transferSolInstruction = SystemProgram.transfer({
    fromPubkey: adminSigner.publicKey,
    toPubkey: newKeyPair.publicKey,
    lamports: minimumBalance,
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: adminSigner.publicKey,
    blockhash,
    lastValidBlockHeight,
  });

  transaction.add(transferSolInstruction);
  const signature = await connection.sendTransaction(transaction, [
    adminSigner,
  ]);
  return {
    pubkey: newKeyPair.publicKey,
    signature,
  };
};
