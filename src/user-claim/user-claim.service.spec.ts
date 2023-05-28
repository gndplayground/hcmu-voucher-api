import { Test, TestingModule } from '@nestjs/testing';
import { UserClaimService } from './user-claim.service';

describe('UserClaimService', () => {
  let service: UserClaimService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserClaimService],
    }).compile();

    service = module.get<UserClaimService>(UserClaimService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
