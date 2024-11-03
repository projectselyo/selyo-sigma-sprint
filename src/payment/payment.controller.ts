import { Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  async createPayment(@Body() payload: { deviceId: string; amount: string }) {
    return await this.paymentService.createPayment(payload.amount);
  }

  // biome-ignore lint/suspicious/noDuplicateClassMembers: <explanation>
  @Post('finalize')
  async createPayment(@Body() payload: { userId: string; amount: string }) {
    return await this.paymentService.finalizePayment(
      payload.userId,
      payload.amount,
    );
  }
}
