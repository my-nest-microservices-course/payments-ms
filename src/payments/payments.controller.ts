import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern({ cmd: 'create.payment.session' }) // use dots because a convention in nats
  createPaymentSession(@Payload() paymentSessionDto: PaymentSessionDto) {
    //TODO log correctly the error if the validation fails, because now has this kind of message: "message": "Internal server error", when it should said something like:  "items.0.productId must be a positive number",
    //     test with "item" instead of "itemS" (the correct name is "items")

    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: 'Payment successful',
    };
  }
  @Get('cancel')
  cancel() {
    return {
      ok: false,
      message: 'Payment failed',
    };
  }

  @Post('webhook')
  async stripeWebhook(@Req() req, @Res() res) {
    return this.paymentsService.stripeWebhook(req, res);
  }
}
