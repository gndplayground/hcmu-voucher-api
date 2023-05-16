import { Test, TestingModule } from '@nestjs/testing';
import { VoucherQuestionsService } from './voucher-questions.service';

describe('VoucherQuestionsService', () => {
  let service: VoucherQuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoucherQuestionsService],
    }).compile();

    service = module.get<VoucherQuestionsService>(VoucherQuestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
