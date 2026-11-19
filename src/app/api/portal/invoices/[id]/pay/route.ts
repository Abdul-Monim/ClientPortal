import { NextResponse, type NextRequest } from "next/server";
import { getPortalRepository } from "@/infrastructure/repositories";
import {
  getAuthenticatedFreelancer,
  getVerifiedClientPortalSession,
} from "@/services/auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const projectId = typeof body?.projectId === "string" ? body.projectId : "";

    if (!projectId) {
      return NextResponse.json({ error: "Project reference is required." }, { status: 400 });
    }

    const repo = getPortalRepository();
    const bundle = await repo.getProjectBundleById(projectId);
    if (!bundle) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const [clientSession, freelancer] = await Promise.all([
      getVerifiedClientPortalSession(bundle.project.id, bundle.project.passcodeVersion),
      getAuthenticatedFreelancer(),
    ]);

    if (!clientSession && !freelancer) {
      return NextResponse.json(
        { error: "Please unlock this client portal before paying an invoice." },
        { status: 401 }
      );
    }

    const invoice = bundle.invoices.find((i) => i.id === invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found for this project." }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json(
        { ok: true, message: "This invoice is already settled.", invoice },
        { status: 200 }
      );
    }

    // If Stripe hosted URL is present and client requested direct redirect
    if (body?.useStripe && invoice.stripeHostedUrl) {
      return NextResponse.json({
        ok: true,
        checkoutUrl: invoice.stripeHostedUrl,
        message: "Redirecting to Stripe hosted invoice checkout.",
      });
    }

    // Process payment settlement
    const paymentMethodNote = typeof body?.paymentMethod === "string" && body.paymentMethod.trim()
      ? body.paymentMethod.trim()
      : "Card / Instant Settlement via Client Portal";

    const updated = await repo.updateInvoiceStatus(invoiceId, "paid", {
      paymentMethodNote,
    });

    return NextResponse.json({
      ok: true,
      message: `Invoice ${invoice.invoiceNumber} has been successfully settled!`,
      invoice: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process invoice payment." },
      { status: 500 }
    );
  }
}
