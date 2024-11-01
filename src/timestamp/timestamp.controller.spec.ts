import { Test, TestingModule } from '@nestjs/testing';
import { TimestampController } from './timestamp.controller';
import { TimestampService } from './timestamp.service';

describe('TimestampController', () => {
  let controller: TimestampController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimestampController],
      providers: [TimestampService],
    }).compile();

    controller = module.get<TimestampController>(TimestampController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
