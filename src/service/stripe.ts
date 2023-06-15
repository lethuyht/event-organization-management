import { configuration } from '@/config';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import dayjs, { Dayjs } from 'dayjs';

@Injectable()
export class StripeAdapter {
  readonly stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: '2022-11-15',
      typescript: true,
    });
  }

  constructEvent(signature: string, payload: Buffer, webhookSecret: string) {
    try {
      console.log('constructEventPayload ----->>>>>>.....', webhookSecret);
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.log('ConstructEvent Log ->>>...', err);
    }
  }

  async createPaymentCustomer(currentUser: any): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.list({
      email: currentUser.email,
    });

    if (customer.data.length > 0) {
      return customer.data[0];
    }

    return await this.stripe.customers.create({
      email: currentUser.email,
      name: currentUser.name,
    });
  }

  async getAccountById(accountId: string) {
    return await this.stripe.accounts.retrieve(accountId);
  }

  async createPaymentMethodForTestingAccount(accountId: string) {
    return await this.stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 7,
        exp_year: 2027,
        cvc: '314',
      },
    });
  }

  async createPaymentIntent({
    amount,
    currency,
    stripeAccountId,
  }: {
    amount: number;
    currency: string;
    stripeAccountId: string;
  }) {
    return this.stripe.paymentIntents.create(
      {
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
      },
      {
        stripeAccount: stripeAccountId,
      },
    );
  }

  async createProduct({
    productName,
    productSystemId,
    imageUrls,
    description,
  }: {
    productName: string;
    productSystemId: string;
    imageUrls: string[];
    description?: string;
  }) {
    return await this.stripe.products.create({
      name: productName,
      images: imageUrls,
      description,
      metadata: {
        productSystemId,
      },
    });
  }

  async getProductByIds(serviceItemIds: string[]) {
    return Promise.all(
      serviceItemIds.map((id) => this.getProductById({ productSystemId: id })),
    );
  }

  async getProductById({
    id,
    productSystemId,
  }: {
    id?: string;
    productSystemId?: string;
  }) {
    if (productSystemId) {
      return (
        await this.stripe.products.search({
          query: `metadata[\'productSystemId\']:\'${productSystemId}\'`,
        })
      ).data[0];
    }

    return await this.stripe.products.retrieve(id);
  }

  async createLineItems(
    items: {
      amount: number;
      currency: string;
      product: string;
      quantity?: number;
    }[],
  ) {
    const lineItems = [];
    for (const item of items) {
      const price = await this.stripe.prices.create({
        unit_amount: item.amount * 100,
        currency: item.currency,
        product: item.product,
      });

      lineItems.push({
        price: price.id,
        quantity: item.quantity || 1,
      });
    }
    return lineItems;
  }

  async createCheckoutSession({
    successUrl,
    cancelUrl,
    mode,
    lineItems,
    emailCustomer,
    metadata,
  }: {
    successUrl: string;
    cancelUrl: string;
    mode: 'payment' | 'subscription';
    lineItems: any;
    description?: string;
    emailCustomer: string;
    metadata: any;
  }) {
    return await this.stripe.checkout.sessions.create({
      success_url: successUrl,
      cancel_url: cancelUrl,
      mode,
      customer_email: emailCustomer,
      line_items: lineItems,
      metadata,
      payment_intent_data: {
        metadata,
      },
      expires_at: dayjs().add(30, 'minutes').unix(),
    });
  }

  async getBalances() {
    return this.stripe.balance.retrieve();
  }

  async retrievePaymentMethod(paymentMethodId: string) {
    return this.stripe.paymentMethods.retrieve(paymentMethodId);
  }

  async getListBalance({
    created,
    type,
    limit,
  }: {
    created: { gt?: number; gte?: number; lt?: number; lte?: number };
    type?: string;
    limit: number;
  }) {
    return this.stripe.balanceTransactions.list({
      limit,
      type,
      created,
    });
  }

  createRefund({ chargeId }: { chargeId: string }) {
    return this.stripe.refunds.create({
      charge: chargeId,
    });
  }

  getPaymentIntent(id: string) {
    return this.stripe.paymentIntents.retrieve(id);
  }
}
