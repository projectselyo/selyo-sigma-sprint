import { Controller, Get, Param } from '@nestjs/common';
import { MetadataService } from './metadata.service';

@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get(':giver-:claimer-:timestamp')
  async getMetadata(
    @Param('giver') giver: string,
    @Param('claimer') claimer: string,
    @Param('timestamp') timestamp: string,
  ) {
    console.log('giver', giver);
    console.log('claimer', claimer);
    console.log('timestamp', timestamp);
    return this.metadataService.getMetadata(giver, claimer, timestamp);
  }
}
