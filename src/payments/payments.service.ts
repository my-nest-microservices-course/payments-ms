import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { envs } from 'src/config';
import { default as Stripe, default as stripe } from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, item, orderId } = paymentSessionDto;
    const lineItems = item.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price) * 100,
      },
      quantity: item.quantity,
    }));
    const session = await this.stripe.checkout.sessions.create({
      // put here orderID
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
    return session;
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

    console.log({ event });
    switch (event.type) {
      case 'charge.succeeded':
        console.log({ metadata: event.data.object.metadata });
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return {
      signature,
    };
  }
}
