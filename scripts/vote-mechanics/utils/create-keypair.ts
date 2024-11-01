import { base58 } from "@metaplex-foundation/umi/serializers";
import { Keypair } from "@solana/web3.js";

async function createKeyPair() {
  const keypair = Keypair.generate();

  console.log('pubkey:', keypair.publicKey.toString());
  console.log('private:', base58.deserialize(keypair.secretKey).toString());
}

createKeyPair();
