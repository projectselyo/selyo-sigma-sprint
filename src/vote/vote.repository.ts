import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Poll, PollOption } from './vote.interface';

@Injectable()
export class VoteRepository {
  constructor(private readonly dbService: DatabaseService) {}

  async createPoll(poll: Poll) {
    return await this.dbService.createPoll(poll);
  }

  async getAllPolls() {
    return await this.dbService.getAllPolls();
  }

  async getPoll(id: string) {
    return await this.dbService.getPoll(id);
  }

  async getPollByHandle(pollHandle: string) {
    return await this.dbService.getPollByHandle(pollHandle);
  }
}
