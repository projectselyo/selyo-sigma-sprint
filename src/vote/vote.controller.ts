import { Controller, Get, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { VoteService } from './vote.service';
import { Poll, PollOption } from './vote.interface';
import { UsersService } from 'src/users/users.service';

@Controller('vote')
export class VoteController {
  constructor(
    private readonly voteService: VoteService,
    private readonly userService: UsersService,
  ) {}

  @Post('create-poll')
  async createPoll(
    @Body() createPoll: Poll,
  ) {
    return await this.voteService.createPoll(createPoll);
  }

  @Get('get-polls')
  async getAllPolls() {
    return await this.voteService.getAllPolls();
  }

  @Get('get-polls/:pollId')
  async getPollById(@Param('pollId') pollId: string) {
    console.log('pollId', pollId);
    return await this.voteService.getPollById(pollId);
  }

  @Get('get-polls/by-handle/:pollHandle')
  async getPollByHandle(@Param('pollHandle') pollHandle: string) {
    return await this.voteService.getPollByHandle(pollHandle);
  }

  @Post(':pollId/select/:optionId')
  async voteFor(
    @Param('pollId') pollId: string,
    @Param('optionId') optionId: string,
    @Body() payload: { uid?: string; email?: string; },
  ) {
    let uid = payload.uid;
    if (payload.email) {
      const user = await this.userService.getUserByEmail(payload.email);
      if (user.uid) {
        uid = user.uid;
      } else {
        throw new BadRequestException('UID is not set for this user with email', payload.email)
      }
    }
    return await this.voteService.voteFor(pollId, optionId, uid);
  }

  @Get('get-polls/:pollId/results')
  async getPollResults(@Param('pollId') pollId: string) {
    return await this.voteService.getResults(pollId);
  }
}
