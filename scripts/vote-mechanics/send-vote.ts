import 'dotenv/config';
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { createKeyPairFromSecretString } from './utils/wallet';
import { createMemoInstruction } from '@solana/spl-memo';

const ADMIN_WALLET_KEY = process.env.ADMIN_WALLET_KEY as string;
const SOLANA_EXTERNAL_RPC_URL = process.env.SOLANA_EXTERNAL_RPC_URL as string;

const connection = new Connection(SOLANA_EXTERNAL_RPC_URL);

// notes:
// send minimumBallance when opening a proposal account

// PROPOSAL PUBKEY: Ara6A89duabhYkQNzb6WfZ2jCVDDnpW4LDguTjKGim1N
// 4Ap9WMFREGrHuWN6dzokGq94kimKc7NFFbPciVyi1WZVvB73W7Kf7VckDzdtBnmD2hZ6knxRVbLGjK5eP8qGEiyr

// VOTER PAIR:
// HY7n25J3Rg54mZDty6HqhZcFQyNacwdaVYf367Ho6zmP
// 4gp2BsZVpb6PeRNJ3hvYbLCNKCxyGCU1jramfwMS1kCtWZm8B7PkTDBRaggvJSwknpfgqfYL8rKPeSAAUYhLP5ZB

const createVoteTransaction = async (
  voter: Keypair,
  adminPayer: Keypair,
  proposalPubKeyString: PublicKey,
  option: string,
) => {
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

async function sendVote() {
  const adminSigner = createKeyPairFromSecretString(ADMIN_WALLET_KEY);
  const voter = createKeyPairFromSecretString(
    '4gp2BsZVpb6PeRNJ3hvYbLCNKCxyGCU1jramfwMS1kCtWZm8B7PkTDBRaggvJSwknpfgqfYL8rKPeSAAUYhLP5ZB',
  );
  const proposal = new PublicKey(
    'Ara6A89duabhYkQNzb6WfZ2jCVDDnpW4LDguTjKGim1N',
  );
  const tx = await createVoteTransaction(
    voter,
    adminSigner,
    proposal,
    'SanWan',
  );

  const signature = await connection.sendTransaction(tx, [adminSigner, voter]);
  console.log('signature', signature);
}

sendVote();
