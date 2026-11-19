import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { verifyStripeWebhookEvent } from "@/infrastructure/billing/stripe";
import { getPortalRepository } from "@/infrastructure/repositories";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  try {
    const rawBody = await request.text();
    const event = verifyStripeWebhookEvent(rawBody, signature);
    const repo = getPortalRepository();

    if (event.type === "invoice.paid") {
      const invoiceObj = event.data.object as Stripe.Invoice;
      if (invoiceObj.id) {
        await repo.markInvoicePaidByStripeId(invoiceObj.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook verification failed." },
      { status: 400 }
    );
  }
}
