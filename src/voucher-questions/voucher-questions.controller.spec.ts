import { Test, TestingModule } from '@nestjs/testing';
import { VoucherQuestionsController } from './voucher-questions.controller';

describe('VoucherQuestionsController', () => {
  let controller: VoucherQuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoucherQuestionsController],
    }).compile();

    controller = module.get<VoucherQuestionsController>(
      VoucherQuestionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
