import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { envs, NATS_SERVICE } from 'src/config';
import { default as Stripe, default as stripe } from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);
  private readonly logger = new Logger('PaymentsService');
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    try {
      const { currency, items, orderId } = paymentSessionDto;
      const lineItems = items.map((item) => ({
        price_data: {
          currency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price) * 100,
        },
        quantity: item.quantity,
      }));
      const session = await this.stripe.checkout.sessions.create({
        payment_intent_data: {
          metadata: {
            orderId,
          },
        },
        line_items: lineItems,
        mode: 'payment',
        success_url: envs.stripeSuccessUrl,
        cancel_url: envs.stripeCancelUrl,
      });
      return {
        cancelUrl: session.cancel_url,
        successUrl: session.success_url,
        url: session.url,
      };
    } catch (error) {
      this.logger.error(`ERROR_CREATE_PAYMENT_SESSION: ${error}`);
      throw new RpcException({
        message: `ERROR_CREATE_PAYMENT_SESSION`,
        status: 400,
      });
    }
  }
  async stripeWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'];
    const endpointSecret = envs.stripeEndpointSecret;
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req['rawBody'],
        signature,
        endpointSecret,
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;
        const payload = {
          stripePaymentId: chargeSucceeded.id,
          orderId: chargeSucceeded.metadata.orderId,
          receiptUrl: chargeSucceeded.receipt_url,
        };

        this.client.emit({ cmd: 'payment.succeeded' }, payload);

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return {
      signature,
    };
  }
}
