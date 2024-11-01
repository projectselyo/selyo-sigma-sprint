import 'dotenv/config';
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  ParsedInstruction,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { createKeyPairFromSecretString } from './utils/wallet';
import { createMemoInstruction } from '@solana/spl-memo';

const ADMIN_WALLET_KEY = process.env.ADMIN_WALLET_KEY as string;
const SOLANA_EXTERNAL_RPC_URL = process.env.SOLANA_EXTERNAL_RPC_URL_DEVNET as string;

const connection = new Connection(SOLANA_EXTERNAL_RPC_URL);

async function fetchMemo() {
  const proposalPubKey = new PublicKey(
    '47p6LmjuviDowCDWCzKCWyHT12TsPqjwe3WDuc8v2uz6',
  );
  const signatures = await connection.getSignaturesForAddress(proposalPubKey);
  console.log('signatures', signatures);

  const outcome = [];
  for (const s of signatures) {
    // console.log('s', s)

  //  const tx = await connection.getParsedTransaction(s.signature, {
  //     maxSupportedTransactionVersion: 2,
  //   });
  //   console.log(tx.transaction.message);

  const tx = await connection.getParsedTransaction(s.signature);
    const ixs = tx.transaction.message.instructions;
    const memos = ixs.filter(
      (ix: ParsedInstruction) => ix.program === 'spl-memo',
    );
    const firstMemo: any = memos.shift();

    console.log('firstMemo', firstMemo);

    outcome.push({
      blockTime: s.blockTime,
      parsed: firstMemo?.parsed,
    });
  }

  // console.log('outcome', outcome)
  // TODO: Simulate 1000 votes
  // signatures 7
  // [
  //   {
  //     parsed: 'HY7n25J3Rg54mZDty6HqhZcFQyNacwdaVYf367Ho6zmP:SanWan',
  //     program: 'spl-memo',
  //     programId: PublicKey [PublicKey(MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr)] {
  //       _bn: <BN: 54a535a992921064d24e87160da387c7c35b5ddbc92bb81e41fa8404105448d>
  //     },
  //     stackHeight: null
  //   }
  // ]
  // [
  //   {
  //     parsed: 'HY7n25J3Rg54mZDty6HqhZcFQyNacwdaVYf367Ho6zmP:undefined',
  //     program: 'spl-memo',
  //     programId: PublicKey [PublicKey(MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr)] {
  //       _bn: <BN: 54a535a992921064d24e87160da387c7c35b5ddbc92bb81e41fa8404105448d>
  //     },
  //     stackHeight: null
  //   }
  // ]
  // [
  //   {
  //     parsed: 'voting:123',
  //     program: 'spl-memo',
  //     programId: PublicKey [PublicKey(MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr)] {
  //       _bn: <BN: 54a535a992921064d24e87160da387c7c35b5ddbc92bb81e41fa8404105448d>
  //     },
  //     stackHeight: null
  //   }
  // ]
  // [
  //   {
  //     parsed: 'voting:123',
  //     program: 'spl-memo',
  //     programId: PublicKey [PublicKey(MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr)] {
  //       _bn: <BN: 54a535a992921064d24e87160da387c7c35b5ddbc92bb81e41fa8404105448d>
  //     },
  //     stackHeight: null
  //   }
  // ]
  // [
  //   {
  //     parsed: 'voting:123',
  //     program: 'spl-memo',
  //     programId: PublicKey [PublicKey(MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr)] {
  //       _bn: <BN: 54a535a992921064d24e87160da387c7c35b5ddbc92bb81e41fa8404105448d>
  //     },
  //     stackHeight: null
  //   }
  // ]
  // [
  //   {
  //     parsed: 'voting:123',
  //     program: 'spl-memo',
  //     programId: PublicKey [PublicKey(MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr)] {
  //       _bn: <BN: 54a535a992921064d24e87160da387c7c35b5ddbc92bb81e41fa8404105448d>
  //     },
  //     stackHeight: null
  //   }
  // ]
  // [
  //   {
  //     parsed: 'voting:123',
  //     program: 'spl-memo',
  //     programId: PublicKey [PublicKey(MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr)] {
  //       _bn: <BN: 54a535a992921064d24e87160da387c7c35b5ddbc92bb81e41fa8404105448d>
  //     },
  //     stackHeight: null
  //   }
  // ]
}

fetchMemo();
