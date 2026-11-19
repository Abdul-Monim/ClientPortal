import Stripe from "stripe";
import type { InvoiceLineItem } from "@/domain/types";
import { isStripeConfigured } from "@/infrastructure/config/env";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe | null {
  if (!isStripeConfigured()) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripeClient;
}

export interface CreateStripeInvoiceRequest {
  customerEmail: string;
  customerName: string;
  title: string;
  currency: string;
  lineItems: InvoiceLineItem[];
  dueDateIso: string;
  finalizeImmediately: boolean;
}

export interface StripeInvoiceResult {
  stripeInvoiceId: string | null;
  stripeHostedUrl: string | null;
  stripePdfUrl: string | null;
}

export async function createOptionalStripeInvoice(
  input: CreateStripeInvoiceRequest
): Promise<StripeInvoiceResult> {
  const stripe = getStripeClient();
  if (!stripe) {
    return {
      stripeInvoiceId: null,
      stripeHostedUrl: null,
      stripePdfUrl: null,
    };
  }

  const existingCustomers = await stripe.customers.list({
    email: input.customerEmail,
    limit: 1,
  });

  const customer =
    existingCustomers.data[0] ??
    (await stripe.customers.create({
      email: input.customerEmail,
      name: input.customerName,
    }));

  const dueTimestamp = Math.floor(new Date(input.dueDateIso).getTime() / 1000);
  const nowTimestamp = Math.floor(Date.now() / 1000);
  const daysUntilDue = Math.max(1, Math.ceil((dueTimestamp - nowTimestamp) / 86400));

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: daysUntilDue,
    description: input.title,
    auto_advance: input.finalizeImmediately,
  });

  if (!invoice.id) {
    throw new Error("Stripe did not return an invoice identifier.");
  }

  for (const item of input.lineItems) {
    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_amount_decimal: String(item.unitAmountCents),
      currency: input.currency.toLowerCase(),
    });
  }

  const finalInvoice = input.finalizeImmediately
    ? await stripe.invoices.finalizeInvoice(invoice.id)
    : invoice;

  return {
    stripeInvoiceId: finalInvoice.id ?? null,
    stripeHostedUrl: finalInvoice.hosted_invoice_url ?? null,
    stripePdfUrl: finalInvoice.invoice_pdf ?? null,
  };
}

export function verifyStripeWebhookEvent(
  rawBody: string,
  signatureHeader: string
): Stripe.Event {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !webhookSecret) {
    throw new Error("Stripe webhook verification is not configured.");
  }
  return stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
}
