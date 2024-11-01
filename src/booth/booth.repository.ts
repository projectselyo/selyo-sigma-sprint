import { Injectable } from '@nestjs/common';
import { Booth, BoothStamp } from './booth.interface';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BoothRepository {
  constructor(private readonly dbService: DatabaseService) { }

  //getting the booths in the booth.interface
  async getBoothById(boothId: string) {
    return await this.dbService.findBoothById(boothId);
  }

  async getAllBooth() {
    return await this.dbService.findAllBooth();
  }

  async createBoothStamp(boothstamp: BoothStamp) {
    return await this.dbService.createBoothStampCollection(boothstamp);
  }

  async getBoothStampCollection(boothId: string) {
    return await this.dbService.getBoothStampCollectionByBoothId(boothId);
  }

  async createBooth(booth: Booth) {
    return await this.dbService.createBooth(booth);
  }

  async findAllBoothStampCollection() {
    return await this.dbService.findAllBoothStampCollection();
  }
}
