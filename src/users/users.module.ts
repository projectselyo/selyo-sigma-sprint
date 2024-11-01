import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { DatabaseModule } from 'src/database/database.module';
import { MulterModule } from '@nestjs/platform-express';
import { BoothRepository } from 'src/booth/booth.repository';
import { MetadataModule } from 'src/metadata/metadata.module';
import { MetadataService } from 'src/metadata/metadata.service';
import { MetadataRepository } from 'src/metadata/metadata.repository';

@Module({
  imports: [
    DatabaseModule,
    MulterModule.register({
      dest: './uploads',
    }),
    MetadataModule, // Make sure this line is present
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    BoothRepository,
    MetadataService,
    MetadataRepository,
  ],
})
export class UsersModule {}
