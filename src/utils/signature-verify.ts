import { base64 } from '@metaplex-foundation/umi/serializers';
import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import * as nacl from 'tweetnacl';
import { decodeUTF8 } from 'tweetnacl-util';
// import web3 from '@solana/web3.js';
// const bs58 = require('bs58');

export function verifySignature(
  message: string,
  signature: string,
  signerPubKeyString: string,
) {
  const u8 = Uint8Array.from(Buffer.from(signature, 'base64'));
  const messageBytes = decodeUTF8(message);
  const signer = new PublicKey(signerPubKeyString);
  const result = nacl.sign.detached.verify(messageBytes, u8, signer.toBytes());
  return result;
}

export function signMessage(message: string, privateKey: string) {
  const signer = Keypair.fromSecretKey(bs58.decode(privateKey));
  const messageBytes = decodeUTF8(message);
  const signature = nacl.sign.detached(messageBytes, signer.secretKey);
  // convert signature to base64
  const signatureBase64 = Buffer.from(signature).toString('base64');
  return signatureBase64;
}
