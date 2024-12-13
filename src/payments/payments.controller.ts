import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
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
