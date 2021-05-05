import { Test, TestingModule } from '@nestjs/testing';
import { RockstarService } from './rockstar.service';

describe('RecognitionService', () => {
  let service: RockstarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RockstarService],
    }).compile();

    service = module.get<RockstarService>(RockstarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});