import { Test, TestingModule } from '@nestjs/testing';
import { RockstarController } from './rockstar.controller';

describe('RockstarController', () => {
  let controller: RockstarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RockstarController],
    }).compile();

    controller = module.get<RockstarController>(RockstarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});