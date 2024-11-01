import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  NotFoundException,
  Patch,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './users.interface';
import { SignatureVerifyDto } from './dto/signature-verify.dto'

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('search')
  async searchByEmail(@Query('email') email: string) {
    console.log('searching by email', email);
    const existingUsers = await this.usersService.searchUserByEmail(email);

    return existingUsers;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadfile(@UploadedFile() file) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.usersService.uploadFile(file);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const existingUsers = await this.usersService.getUserByEmail(
      createUserDto.email,
    );
    if (existingUsers) {
      throw new BadRequestException(
        `Email: '${createUserDto.email}' already exist`,
      );
    }
    return this.usersService.createUser(createUserDto);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updates: User) {
    const result = await this.usersService.updateUser(id, updates);

    return result;
  }

  @Delete(':email')
  softDelete(@Param('email') email: string) {
    return this.usersService.softDelete(email);
  }

  @Get(':uidOrEmailOrHandle')
  async getUserProfile(
    @Param('uidOrEmailOrHandle') uidOrEmailOrHandle: string,
  ) {
    const profile = await this.usersService.getUserProfile(uidOrEmailOrHandle);
    if (profile) {
      return profile;
    }
    throw new NotFoundException('Profile not found');
  }

  @Post('signature/verify')
  async signatureVerify(@Body() verifyPayload: SignatureVerifyDto) {
    return await this.usersService.verifySignature({
      message: verifyPayload.message,
      signature: verifyPayload.signature,
      pubkey: verifyPayload.pubkey,
    });
  }

  @Post('genesis/claim')
  async claimGenesiNft(@Body() verifyPayload: SignatureVerifyDto) {
    return await this.usersService.claimGenesisNft({
      message: verifyPayload.message,
      signature: verifyPayload.signature,
      pubkey: verifyPayload.pubkey,
    });
  }

  @Post(':uid/signed-message')
  async getSignedMessage(@Body() payload: any, @Param('uid') uid: string) {
    return await this.usersService.getSignedMessageByUser(payload.message, uid);
  }

  @Post(':uid/fistbump')
  async getFistBump(@Param('uid') uid: string) {
    return await this.usersService.createFistbumpClaim(uid);
  }

  @Post('fistbump/claim')
  async verifyFistBump(@Body() payload: any) {
    const { code, claimerPubkey, notes, venue } = payload;
    return await this.usersService.verifyAndClaimFistBump(
      code,
      claimerPubkey,
      notes,
      venue,
    );
  }

  @Get('assets/:pubkey')
  async getAssetsByPubkey(@Param('pubkey') pubkey: string) {
    return await this.usersService.getAssetsByPubkey(pubkey);
  }

  @Post('magic-login/create')
  async createMagicLogin(@Body() payload: { entity: string }) {
    await this.usersService.createMagicLogin(payload.entity);
  }

  @Post('magic-login/claim')
  async claimMagicLogin(@Body() payload: { email: string; code: string }) {
    return await this.usersService.claimMagicLogin(payload.email, payload.code);
  }

  @Post('tx-pending/clear')
  async clearTxPending() {
    return await this.usersService.clearAllTxPending()
  }
}
