import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VoteRepository } from './vote.repository';
import { UsersService } from 'src/users/users.service';
import { sendVote } from 'src/solana/voting.onchain';
import { Connection, Keypair, ParsedInstruction, PublicKey } from '@solana/web3.js';
import { ConfigService } from '@nestjs/config';
import { generateAccount } from 'src/solana/create-account.onchain';
import { Poll, PollOption } from './vote.interface';
import { mintNftBasic } from 'src/booth/nft/nft';

function phraseToDashDelimited(phrase) {
  let result = phrase.toLowerCase();
  result = result.replace(/\s+/g, '-');
  result = result.replace(/[^a-z0-9-]/g, '');
  result = result.replace(/^-+|-+$/g, '');
  result = result.replace(/-+/g, '-');
  return result;
}

@Injectable()
export class VoteService {
  constructor(
    private configService: ConfigService,
    private readonly voteRepository: VoteRepository,
    private readonly userService: UsersService,
  ) { }

  async createPoll(poll: Poll) {
    const wallet = this.configService.get('sol.GENESIS_ADMIN_WALLET');
    const rpcUrl = this.configService.get('sol.RPC_URL.DEVNET');

    const account = await generateAccount({
      adminWalletSecret: wallet,
      rpcUrl: rpcUrl,
    });
    const DEFAULT_METADATA_URL = 'https://gist.githubusercontent.com/kimerran/d7bd1ced506ff5a61ca52044edd2522b/raw/46cc432abf06a7fa0d686a9aa7db41940f76f10f/metadata.json';
    const DEFAULT_IMAGE_URL = 'https://i.imgur.com/cwj1WST.jpeg';

    const cleanedOptions: Array<PollOption> = poll.options.map((o) => {
      const name = o.name;
      return {
        name: name,
        symbol: `SYL${name.substring(0, 4)}`.toUpperCase(),
        metadataUrl: o.metadataUrl || DEFAULT_METADATA_URL,
        imageUrl: o.imageUrl || DEFAULT_IMAGE_URL,
      }
    });

    const newPoll: Poll = {
      name: poll.name,
      description: poll.description,
      handle: phraseToDashDelimited(poll.name),
      options: cleanedOptions,
      pubkey: account.pubkey.toBase58()
    }

    return await this.voteRepository.createPoll(newPoll);
  }

  async getAllPolls() {
    return await this.voteRepository.getAllPolls();
  }

  async getPollById(pollId: string) {
    const poll = await this.voteRepository.getPoll(pollId);
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    return poll;
  }

  async getPollByHandle(pollHandle: string) {
    const poll = await this.voteRepository.getPollByHandle(pollHandle);
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    return poll;
  }

  async voteFor(pollId: string, option: string, uid: string) {
    const wallet = this.configService.get('sol.ADMIN_WALLET_KEY');
    const rpcUrl = this.configService.get('sol.RPC_URL.DEVNET');

    // check if the options for pollID  exists
    const poll = await this.voteRepository.getPoll(pollId);
    const pollOptions = poll.options.map((o) => o.name);
    const TEMPORARY_MERKLE_TREE_FOR_TEST =
      '2RyXoopf57v2E4bPkv127ibF2dADYwnAncBFfGgqtSkW';

    if (poll) {
      // check if option is part of the poll
      if (pollOptions.includes(option)) {
        const user = await this.userService.getUserOwningUID(uid);

        const txPending = await this.userService.checkTxPending(
          user.email,
          'vote',
        );
        if (txPending) {
          console.log('txPending');
          throw new BadRequestException('Tx is pending for this action');
        }
        await this.userService.createTxPending(user.email, 'vote');

        const selectedOption = poll.options
          .filter((o) => o.name === option)
          .shift();

        if (user) {
          const tx = await sendVote({
            adminWalletSecret: wallet,
            voterSecret: user.privateKey,
            pollPubKey: poll.pubkey,
            optionSelected: option,
            rpcUrl: rpcUrl,
          });

          // TODO: Before we can put dupe check here,
          // we need to mint this in a collection?
          const tx2 = await mintNftBasic({
            adminWalletSecret: wallet,
            nftName: selectedOption.name,
            nftSymbol: selectedOption.symbol,
            metadataUri: selectedOption.metadataUrl,
            destinationUser: user.publicKey,
            merkleTreePubkey: TEMPORARY_MERKLE_TREE_FOR_TEST,
            rpcUrl: rpcUrl,
          });

          // TODO: mint corresponding NFT as well
          await this.userService.deleteTxPending(user.email, 'vote');
          return { tx, tx2 };
        }
        throw new BadRequestException('User not found');
      }
      throw new BadRequestException('Option is invalid');
    }
    throw new BadRequestException('Poll is not existing');
  }

  async getResults(pollId: string) {
    const rpcUrl = this.configService.get('sol.RPC_URL.DEVNET');

    // check if the options for pollID  exists
    const poll = await this.voteRepository.getPoll(pollId);
    // poll.pubkey
    const connection = new Connection(rpcUrl);

    const signatures = await connection.getSignaturesForAddress(new PublicKey(poll.pubkey));
    const outcome = [];
    for (const s of signatures) {
      const tx = await connection.getParsedTransaction(s.signature);
      const ixs = tx.transaction.message.instructions;
      const memos = ixs.filter(
        (ix: ParsedInstruction) => ix.program === 'spl-memo',
      );
      console.log('memos', memos)
      const firstMemo: any = memos.shift();

      // console.log('firstMemo', firstMemo);
      if (firstMemo?.parsed) {
        outcome.push({
          blockTime: s.blockTime,
          parsed: firstMemo?.parsed,
        });
      }
    }

    // process this outcome
    // sort?
    outcome.sort((a, b) => {
      if (a.blockTime < b.blockTime) return -1;
      if (a.blockTime > b.blockTime) return 1;
      return 0;
    });
    const result = {}
    for (const row of outcome) {
      const [wallet, choice] = row.parsed.split(':')
      if (!result[wallet]) {
        result[wallet] = choice
      }

    }
    // {
    //   "ET1pEHaUYeasyPa8yd1YbC2QT2ofwxDzV7o8YvD5jHCG": "mark",
    //   "13Ex3jfKHCc1MRbd7Hzx67thYHPPNVXTwqQc7pNj8YvF": "neri"
    // }
    const result2 = {}
    for (const key in result) {
      console.log(key)
      if (!result2[result[key]]) {
        result2[result[key]] = 1
      } else {
        result2[result[key]]++;

      }
    }
    return result2;
  }
}
