import { Module } from '@nestjs/common';
import { BoothService } from './booth.service';
import { BoothController } from './booth.controller';
import { BoothRepository } from './booth.repository';
import { DatabaseModule } from 'src/database/database.module';
import { UsersService } from 'src/users/users.service';
import { UsersRepository } from 'src/users/users.repository';
import { MetadataService } from 'src/metadata/metadata.service';
import { MetadataRepository } from 'src/metadata/metadata.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [BoothController],
  providers: [
    BoothService,
    BoothRepository,
    UsersService,
    UsersRepository,
    MetadataService,
    MetadataRepository,
  ],
  exports: [
    BoothService,
    BoothRepository,
    UsersService,
    UsersRepository,
    MetadataService,
    MetadataRepository,
  ],
})
export class BoothModule {}
