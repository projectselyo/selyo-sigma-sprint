import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { createMemoInstruction } from '@solana/spl-memo';
import bs58 from 'bs58';

export const createKeyPairFromSecretString = (secret: string) => {
  return Keypair.fromSecretKey(bs58.decode(secret));
};

export const sendVote = async (params: {
  adminWalletSecret: string;
  voterSecret: string;
  pollPubKey: string;
  optionSelected: string;
  rpcUrl: string;
}) => {
  const adminSigner = createKeyPairFromSecretString(params.adminWalletSecret);
  const voter = createKeyPairFromSecretString(params.voterSecret);
  const proposal = new PublicKey(params.pollPubKey);

  const tx = await createVoteTransaction(
    voter,
    adminSigner,
    proposal,
    params.optionSelected,
    params.rpcUrl,
  );
  const connection = new Connection(params.rpcUrl);

  const signature = await connection.sendTransaction(tx, [adminSigner, voter]);
  console.log('signature', signature);
  return signature;
};

export const createVoteTransaction = async (
  voter: Keypair,
  adminPayer: Keypair,
  proposalPubKeyString: PublicKey,
  option: string,
  rpcUrl: string,
) => {
  const connection = new Connection(rpcUrl);

  const minimumBalance = await connection.getMinimumBalanceForRentExemption(0);
  console.log('min', minimumBalance);

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const setComputeLimit = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_000_000, // Requesting 1,000,000 compute units
  });

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 10000,
  });

  const transferSolInstruction = SystemProgram.transfer({
    fromPubkey: adminPayer.publicKey,
    toPubkey: proposalPubKeyString,
    lamports: 1,
  });

  const transaction = new Transaction({
    feePayer: adminPayer.publicKey,
    blockhash,
    lastValidBlockHeight,
  });

  const memoIx = createMemoInstruction(
    `${voter.publicKey.toString()}:${option}`,
    [adminPayer.publicKey, voter.publicKey],
  );

  transaction.add(setComputeLimit);
  transaction.add(addPriorityFee);
  transaction.add(transferSolInstruction);
  transaction.add(memoIx);

  // transaction.sign(adminPayer);
  // transaction.sign(voter);

  return transaction;
};
