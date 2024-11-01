import { Module } from '@nestjs/common';
import { TimestampService } from './timestamp.service';
import { TimestampController } from './timestamp.controller';
import { TimestampRepository } from './timestamp.repository';
import { DatabaseModule } from 'src/database/database.module';
import { UsersService } from 'src/users/users.service';
import { UsersRepository } from 'src/users/users.repository';
import { BoothService } from 'src/booth/booth.service';
import { BoothRepository } from 'src/booth/booth.repository';
import { MetadataService } from 'src/metadata/metadata.service';
import { MetadataRepository } from 'src/metadata/metadata.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [TimestampController],
  providers: [
    TimestampService,
    TimestampRepository,
    UsersService,
    UsersRepository,
    BoothService,
    BoothRepository,
    MetadataService,
    MetadataRepository,
  ],
  exports: [TimestampService, TimestampRepository],
})
export class TimestampModule {}
