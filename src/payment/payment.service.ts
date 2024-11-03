import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

import { Wormhole } from '@wormhole-foundation/sdk';
import solana from '@wormhole-foundation/sdk/platforms/solana';
import evm from '@wormhole-foundation/sdk/platforms/evm';

import '@wormhole-foundation/sdk-evm-ntt';
import '@wormhole-foundation/sdk-solana-ntt';

@Injectable()
export class PaymentService {
  constructor(private readonly userService: UsersService) {}

  async createPayment(amount: string) {
    // create dummy payment
    console.log('creatign payment for amount', amount);
    return +new Date();
  }

  async finalizePayment(userId: string, amount: string) {
    const user = await this.userService.getUserProfile(userId);

    const SOLANA_KEY = user.user.privateKey.solana;
    const SEPOLIA_KEY = user.user.privateKey.evm;

    const wh = new Wormhole('Testnet', [solana.Platform, evm.Platform]);
    const sourceChain = wh.getChain('Solana');
    const destinationChain = wh.getChain('Sepolia');

    const sourceSigner = await solana.getSigner(
      await sourceChain.getRpc(),
      SOLANA_KEY,
    );

    // const sourceWallet = {
    //   chain: sourceChain,
    //   signer: sourceSigner,
    //   address: Wormhole.chainAddress(sourceChain.chain, sourceSigner.address()),
    // };

    const destinationSigner = await evm.getSigner(
      await destinationChain.getRpc(),
      SEPOLIA_KEY,
    );

    const sourceAddress = Wormhole.chainAddress(
      sourceChain.chain,
      sourceSigner.address(),
    );

    const destinationAddress = Wormhole.chainAddress(
      destinationChain.chain,
      destinationSigner.address(),
    );
    const token = Wormhole.tokenId(sourceChain.chain, 'native');
    const tx = await wh.tokenTransfer(
      token,
      BigInt(amount),
      sourceAddress,
      destinationAddress,
      false,
    );
    return tx;
  }
}
