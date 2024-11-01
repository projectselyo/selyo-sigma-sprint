import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Metadata } from './metadata.interface';

@Injectable()
export class MetadataRepository {
  constructor(private readonly dbService: DatabaseService) {}

  async getMetadataById(id2: string): Promise<Metadata> {
    // Implement method to get metadata by ID
    return await this.dbService.getMetadataById2(id2);
  }

  async createMetadata(createDto: any): Promise<Metadata> {
    const potentialId = `${createDto.giver}-${createDto.claimer}-${createDto.timestamp}`;

    const newMetadata: Metadata = {
      ...createDto,
      id2: potentialId,
      giver: createDto.giver,
      claimer: createDto.claimer,
    };
    console.log('newMetadata', newMetadata);
    await this.dbService.saveNewMetadata(newMetadata);
    return newMetadata;
  }
}
