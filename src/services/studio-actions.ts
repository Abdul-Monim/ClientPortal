"use server";

import { revalidatePath } from "next/cache";
import { dollarsToCents, taxPercentToBps } from "@/domain/money";
import {
  createDeliverableSchema,
  createInvoiceSchema,
  createMilestoneSchema,
  createProjectSchema,
  publishDeliverableVersionSchema,
  rotatePasscodeSchema,
  updateMilestoneStatusSchema,
  updateStudioSchema,
} from "@/domain/schemas";
import type { InvoiceStatus } from "@/domain/types";
import { createOptionalStripeInvoice } from "@/infrastructure/billing/stripe";
import { getPortalRepository } from "@/infrastructure/repositories";
import { hashPasscode } from "@/infrastructure/security/passcode";
import { getAuthenticatedFreelancer } from "./auth";

export interface ActionResult<T = undefined> {
  ok: boolean;
  message: string;
  data?: T;
}

async function requireFreelancer() {
  const user = await getAuthenticatedFreelancer();
  if (!user) {
    throw new Error("Please sign in to manage your studio.");
  }
  return user;
}

export async function updateStudioBrandingAction(
  input: unknown
): Promise<ActionResult> {
  try {
    const user = await requireFreelancer();
    const parsed = updateStudioSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Please check your studio details.",
      };
    }

    const repo = getPortalRepository();
    const studio = await repo.getStudioForOwner(user.id);
    await repo.updateStudio(studio.id, {
      studioName: parsed.data.studioName,
      slug: parsed.data.slug,
      customDomain: parsed.data.customDomain || null,
      tagline: parsed.data.tagline,
      logoUrl: parsed.data.logoUrl || null,
      accentHex: parsed.data.accentHex,
      welcomeMessage: parsed.data.welcomeMessage,
      contactEmail: parsed.data.contactEmail,
      billingAddress: parsed.data.billingAddress,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/branding");
    revalidatePath("/p", "layout");
    return { ok: true, message: "Studio branding updated across all client portals." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save studio branding.",
    };
  }
}

export async function createProjectAction(
  input: unknown
): Promise<ActionResult<{ projectId: string }>> {
  try {
    const user = await requireFreelancer();
    const parsed = createProjectSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Please check project details.",
      };
    }

    const repo = getPortalRepository();
    const studio = await repo.getStudioForOwner(user.id);
    const { hash, salt } = hashPasscode(parsed.data.passcode);

    const project = await repo.createProject(studio.id, {
      title: parsed.data.title,
      slug: parsed.data.slug,
      summary: parsed.data.summary,
      clientName: parsed.data.clientName,
      clientCompany: parsed.data.clientCompany,
      clientEmail: parsed.data.clientEmail,
      passcodeHash: hash,
      passcodeSalt: salt,
      passcodeHint: parsed.data.passcodeHint || null,
      targetLaunchDate: parsed.data.targetLaunchDate || null,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");
    return {
      ok: true,
      message: `Created client portal for ${project.clientCompany}.`,
      data: { projectId: project.id },
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not create project.",
    };
  }
}

export async function rotateProjectPasscodeAction(
  input: unknown
): Promise<ActionResult> {
  try {
    await requireFreelancer();
    const parsed = rotatePasscodeSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Please enter a valid password.",
      };
    }

    const repo = getPortalRepository();
    const { hash, salt } = hashPasscode(parsed.data.newPasscode);
    await repo.rotateProjectPasscode(
      parsed.data.projectId,
      hash,
      salt,
      parsed.data.passcodeHint || null
    );

    revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);
    revalidatePath("/p", "layout");
    return {
      ok: true,
      message: "Portal password updated. Previous client sessions have been signed out.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not update password.",
    };
  }
}

export async function createMilestoneAction(input: unknown): Promise<ActionResult> {
  try {
    await requireFreelancer();
    const parsed = createMilestoneSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Please check milestone details.",
      };
    }

    const repo = getPortalRepository();
    await repo.createMilestone({
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      description: parsed.data.description,
      weightPct: parsed.data.weightPct,
      dueDate: parsed.data.dueDate || null,
    });

    revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);
    revalidatePath("/p", "layout");
    return { ok: true, message: "Milestone added to project roadmap." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not add milestone.",
    };
  }
}

export async function updateMilestoneStatusAction(
  input: unknown
): Promise<ActionResult> {
  try {
    await requireFreelancer();
    const parsed = updateMilestoneStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, message: "Invalid milestone status." };
    }

    const repo = getPortalRepository();
    await repo.updateMilestoneStatus(
      parsed.data.projectId,
      parsed.data.milestoneId,
      parsed.data.status
    );

    revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);
    revalidatePath("/p", "layout");
    return { ok: true, message: "Milestone status updated." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not update milestone.",
    };
  }
}

export async function createDeliverableAction(input: unknown): Promise<ActionResult> {
  try {
    await requireFreelancer();
    const parsed = createDeliverableSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Please check deliverable fields.",
      };
    }

    const repo = getPortalRepository();
    await repo.createDeliverable({
      projectId: parsed.data.projectId,
      milestoneId: parsed.data.milestoneId || null,
      title: parsed.data.title,
      summary: parsed.data.summary,
      kind: parsed.data.kind,
      assetUrl: parsed.data.assetUrl || null,
      assetPublicId: parsed.data.assetPublicId || null,
      externalUrl: parsed.data.externalUrl || null,
      releaseNotes: parsed.data.releaseNotes,
      fileSizeBytes: parsed.data.fileSizeBytes ?? null,
    });

    revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);
    revalidatePath("/p", "layout");
    return { ok: true, message: "Deliverable published to client portal." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not publish deliverable.",
    };
  }
}

export async function publishDeliverableVersionAction(
  input: unknown
): Promise<ActionResult> {
  try {
    await requireFreelancer();
    const parsed = publishDeliverableVersionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Please check version details.",
      };
    }

    const repo = getPortalRepository();
    const updated = await repo.publishDeliverableVersion({
      projectId: parsed.data.projectId,
      deliverableId: parsed.data.deliverableId,
      assetUrl: parsed.data.assetUrl || null,
      assetPublicId: parsed.data.assetPublicId || null,
      externalUrl: parsed.data.externalUrl || null,
      releaseNotes: parsed.data.releaseNotes,
      fileSizeBytes: parsed.data.fileSizeBytes ?? null,
    });

    revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);
    revalidatePath("/p", "layout");
    return {
      ok: true,
      message: `Published version v${updated.currentVersion} for client review.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not publish new version.",
    };
  }
}

export async function createInvoiceAction(input: unknown): Promise<ActionResult> {
  try {
    await requireFreelancer();
    const parsed = createInvoiceSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Please check invoice details.",
      };
    }

    const repo = getPortalRepository();
    const bundle = await repo.getProjectBundleById(parsed.data.projectId);
    if (!bundle) {
      return { ok: false, message: "Selected project could not be found." };
    }

    const lineItemDrafts = parsed.data.lineItems.map((item, idx) => {
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
      lineItems: lineItemDrafts,
      dueDateIso: parsed.data.dueDate,
      finalizeImmediately: parsed.data.issueImmediately,
    });

    await repo.createInvoice({
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      currency: parsed.data.currency,
      taxBps: taxPercentToBps(parsed.data.taxPercent),
      lineItems: lineItemDrafts,
      notes: parsed.data.notes,
      dueDate: parsed.data.dueDate,
      status: parsed.data.issueImmediately ? "sent" : "draft",
      stripeInvoiceId: stripeResult.stripeInvoiceId,
      stripeHostedUrl: stripeResult.stripeHostedUrl,
      stripePdfUrl: stripeResult.stripePdfUrl,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);
    revalidatePath("/p", "layout");
    return {
      ok: true,
      message: stripeResult.stripeInvoiceId
        ? "Invoice issued and synced with Stripe."
        : "Invoice issued and available in the client portal.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not create invoice.",
    };
  }
}

export async function updateInvoiceStatusAction(params: {
  invoiceId: string;
  projectId: string;
  status: InvoiceStatus;
  paymentMethodNote?: string;
}): Promise<ActionResult> {
  try {
    await requireFreelancer();
    const repo = getPortalRepository();
    await repo.updateInvoiceStatus(params.invoiceId, params.status, {
      paymentMethodNote: params.paymentMethodNote,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/projects/${params.projectId}`);
    revalidatePath("/p", "layout");
    return { ok: true, message: `Invoice marked as ${params.status}.` };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not update invoice status.",
    };
  }
}
