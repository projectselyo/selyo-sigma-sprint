import { Injectable } from '@nestjs/common';
import { MetadataRepository } from './metadata.repository';

@Injectable()
export class MetadataService {
  constructor(private readonly metadataRepository: MetadataRepository) {}

  async saveMetadata(metadata: any) {
    return await this.metadataRepository.createMetadata(metadata);
  }

  async getMetadata(giver: string, claimer: string, timestamp: string) {
    const id2 = `${giver}-${claimer}-${timestamp}`;
    const metadataFromDb = await this.metadataRepository.getMetadataById(id2);
    const metadata = {
      name: 'Break Point 2024 Singapore Fistbump',
      symbol: 'ZELYOBUMP',
      description: 'Break Point Fistbump by Project Selyo',
      image: 'https://i.imgur.com/cwj1WST.jpeg',
      attributes: [
        {
          trait_type: 'x_profile',
          value: '@projectselyo',
        },
        {
          trait_type: 'giver',
          value: giver,
        },
        {
          trait_type: 'claimer',
          value: claimer,
        },
        {
          trait_type: 'timestamp',
          value: timestamp,
        },
        {
          trait_type: 'notes',
          value: metadataFromDb?.notes || 'None',
        },
        {
          trait_type: 'venue',
          value: metadataFromDb?.venue || 'None',
        },
      ],
    };
    return metadata;
  }
}
