import { Test, TestingModule } from '@nestjs/testing';
import { UserClaimController } from './user-claim.controller';

describe('UserClaimController', () => {
  let controller: UserClaimController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserClaimController],
    }).compile();

    controller = module.get<UserClaimController>(UserClaimController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
