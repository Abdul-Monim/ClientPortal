import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  dollarsToCents,
  summarizeAccountsReceivable,
  taxPercentToBps,
} from "@/domain/money";
import { createInvoiceSchema } from "@/domain/schemas";
import { InvalidStateTransitionError } from "@/domain/state-machines";
import { createOptionalStripeInvoice } from "@/infrastructure/billing/stripe";
import {
  apiError,
  apiOk,
  requireApiFreelancer,
} from "@/infrastructure/http/api-response";
import { sendTransactionalEmail } from "@/infrastructure/notifications/email";
import { getPortalRepository } from "@/infrastructure/repositories";

export const dynamic = "force-dynamic";

const patchInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
  status: z.enum(["sent", "paid", "overdue", "void"]),
  paymentMethodNote: z.string().trim().max(160).optional(),
});

export async function GET() {
  const { freelancer, unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse || !freelancer) return unauthorizedResponse!;

  try {
    const repo = getPortalRepository();
    const studio = await repo.getStudioForOwner(freelancer.id);
    const invoices = await repo.listInvoicesForStudio(studio.id);
    return apiOk({
      invoices,
      summary: summarizeAccountsReceivable(invoices),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not load invoices.",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  const { unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = await request.json();
    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Invalid invoice payload.",
        400,
        parsed.error.issues
      );
    }

    const repo = getPortalRepository();
    const bundle = await repo.getProjectBundleById(parsed.data.projectId);
    if (!bundle) {
      return apiError("Project not found.", 404);
    }

    const lineItems = parsed.data.lineItems.map((item, idx) => {
      const unitAmountCents = dollarsToCents(item.unitAmountDollars);
      return {
        id: `li-${idx + 1}`,
        description: item.description,
        quantity: item.quantity,
        unitAmountCents,
        amountCents: item.quantity * unitAmountCents,
      };
    });

    const stripeResult = await createOptionalStripeInvoice({
      customerEmail: bundle.project.clientEmail,
      customerName: bundle.project.clientCompany,
      title: parsed.data.title,
      currency: parsed.data.currency,
      lineItems,
      dueDateIso: parsed.data.dueDate,
      finalizeImmediately: parsed.data.issueImmediately,
    });

    const invoice = await repo.createInvoice({
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      currency: parsed.data.currency,
      taxBps: taxPercentToBps(parsed.data.taxPercent),
      lineItems,
      notes: parsed.data.notes,
      dueDate: parsed.data.dueDate,
      status: parsed.data.issueImmediately ? "sent" : "draft",
      stripeInvoiceId: stripeResult.stripeInvoiceId,
      stripeHostedUrl: stripeResult.stripeHostedUrl,
      stripePdfUrl: stripeResult.stripePdfUrl,
    });

    const emailDispatch = await sendTransactionalEmail({
      to: bundle.project.clientEmail,
      subject: `New Invoice ${invoice.invoiceNumber} from ${bundle.studio.studioName}`,
      text: `Invoice ${invoice.invoiceNumber} (${invoice.title}) is now available inside your client portal.`,
    });

    return apiOk({ invoice, emailDispatch }, 201);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not create invoice.",
      400
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { unauthorizedResponse } = await requireApiFreelancer();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = await request.json();
    const parsed = patchInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Invalid invoice update payload.",
        400,
        parsed.error.issues
      );
    }

    const repo = getPortalRepository();
    const updated = await repo.updateInvoiceStatus(
      parsed.data.invoiceId,
      parsed.data.status,
      {
        paymentMethodNote: parsed.data.paymentMethodNote ?? null,
      }
    );
    return apiOk(updated);
  } catch (error) {
    if (error instanceof InvalidStateTransitionError) {
      return apiError(error.message, 409);
    }
    return apiError(
      error instanceof Error ? error.message : "Could not update invoice.",
      400
    );
  }
}
