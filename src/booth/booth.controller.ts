import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BoothService } from './booth.service';
import { BoothStamp, AllBooth, Booth } from './booth.interface';

@Controller('booth')
export class BoothController {
  constructor(private readonly boothService: BoothService) { }

  @Get()
  async getAllData() {
    return await this.boothService.findAllBooth();
  }

  @Post()
  async createBooth(@Body() booth: Booth): Promise<Booth | undefined> {
    return await this.boothService.createBooth(booth);
  }

  @Get(':id')
  async getBoothById(@Param('id') boothID: string) {
    return await this.boothService.getBoothById(boothID);
  }

  @Post(':boothId/collection')
  async createBoothStampCollection(
    @Param('boothId') boothId: string,
    @Body() boothStamp: BoothStamp,
  ): Promise<BoothStamp | undefined> {
    console.log('boothStamp', boothStamp)
    try {
      console.log('boothStamp', boothStamp)
      return this.boothService.createStampCollection({
        boothId,
        metadataUri: boothStamp.collectionMetadataUri,
        collectioName: boothStamp.collectionName,
      });
    } catch (error) {
      console.error(error)
    }

  }

  @Post(':boothId/stamp')
  async sendStampToUserWallet(
    @Param('boothId') boothId: string,
    @Body() payload: { uid: string },
  ) {
    return await this.boothService.mintStampToUser(payload.uid, boothId);
  }

  @Get('/collection-results/:collectionKey')
  async getAssetsByCollection(@Param('collectionKey') collectionKey: string) {
    return await this.boothService.getAssetsByCollection(collectionKey);
  }

  @Post('/collection-results/with-booths')
  async getAssetsFromGivenBoothIds(@Body() payload: { booths: [string] }) {
    return await this.boothService.questCompletion(payload.booths);
  }
}
