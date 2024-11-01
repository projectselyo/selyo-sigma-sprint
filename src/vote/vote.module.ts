import { Module } from '@nestjs/common';
import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';
import { DatabaseModule } from 'src/database/database.module';
import { VoteRepository } from './vote.repository';
import { UsersService } from 'src/users/users.service';
import { UsersRepository } from 'src/users/users.repository';
import { BoothRepository } from 'src/booth/booth.repository';
import { MetadataService } from 'src/metadata/metadata.service';
import { MetadataRepository } from 'src/metadata/metadata.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [VoteController],
  providers: [
    VoteService,
    VoteRepository,
    UsersService,
    UsersRepository,
    BoothRepository,
    MetadataService,
    MetadataRepository,
  ],
})
export class VoteModule {}
