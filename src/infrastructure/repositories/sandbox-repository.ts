import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { calculateInvoiceTotals } from "@/domain/money";
import {
  assertDeliverableTransition,
  assertInvoiceTransition,
} from "@/domain/state-machines";
import { normalizeAccentHex } from "@/domain/theme";
import type {
  ActivityEvent,
  Deliverable,
  DeliverableComment,
  Invoice,
  InvoiceStatus,
  Milestone,
  MilestoneStatus,
  Project,
  ProjectBundle,
  Studio,
} from "@/domain/types";
import { createInitialSandboxState, type SandboxDatabaseState } from "./seed-data";
import type {
  AddCommentInput,
  CreateDeliverableInput,
  CreateInvoiceInput,
  CreateMilestoneInput,
  CreateProjectInput,
  PortalRepository,
  PublishVersionInput,
  SubmitDecisionInput,
  UpdateStudioInput,
} from "./types";

const SANDBOX_STORE_FILE = path.join(process.cwd(), ".clientportal-sandbox.json");

function loadState(filePath: string): SandboxDatabaseState {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as SandboxDatabaseState;
      if (parsed?.studio?.id && Array.isArray(parsed.projects)) {
        return parsed;
      }
    }
  } catch {
    // Fall back to clean seed state if local sandbox cache is unreadable
  }
  const initial = createInitialSandboxState();
  saveState(filePath, initial);
  return initial;
}

function saveState(filePath: string, state: SandboxDatabaseState): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // Ignore disk write failure on read-only serverless file systems
  }
}

export class SandboxPortalRepository implements PortalRepository {
  private readonly filePath: string;
  private memoryState: SandboxDatabaseState | null = null;

  constructor(filePath = SANDBOX_STORE_FILE) {
    this.filePath = filePath;
  }

  private read(): SandboxDatabaseState {
    if (this.filePath === ":memory:") {
      if (!this.memoryState) {
        this.memoryState = createInitialSandboxState();
      }
      return this.memoryState;
    }
    return loadState(this.filePath);
  }

  private commit(state: SandboxDatabaseState): void {
    if (this.filePath === ":memory:") {
      this.memoryState = state;
      return;
    }
    saveState(this.filePath, state);
  }

  private appendActivity(
    state: SandboxDatabaseState,
    event: Omit<ActivityEvent, "id" | "createdAt">
  ): void {
    state.activities.unshift({
      ...event,
      id: `act-${randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    });
  }

  async getStudioForOwner(): Promise<Studio> {
    return this.read().studio;
  }

  async getStudioBySlug(slug: string): Promise<Studio | null> {
    const state = this.read();
    return state.studio.slug.toLowerCase() === slug.toLowerCase() ? state.studio : null;
  }

  async getStudioByCustomDomain(domain: string): Promise<Studio | null> {
    const state = this.read();
    const target = domain.toLowerCase();
    if (state.studio.customDomain?.toLowerCase() === target) {
      return state.studio;
    }
    const subdomain = target.split(".")[0];
    if (subdomain && state.studio.slug.toLowerCase() === subdomain) {
      return state.studio;
    }
    return null;
  }

  async updateStudio(studioId: string, input: UpdateStudioInput): Promise<Studio> {
    const state = this.read();
    if (state.studio.id !== studioId) {
      throw new Error("Studio not found.");
    }
    state.studio = {
      ...state.studio,
      studioName: input.studioName,
      slug: input.slug,
      customDomain: input.customDomain,
      tagline: input.tagline,
      logoUrl: input.logoUrl,
      accentHex: normalizeAccentHex(input.accentHex),
      welcomeMessage: input.welcomeMessage,
      contactEmail: input.contactEmail,
      billingAddress: input.billingAddress,
      updatedAt: new Date().toISOString(),
    };
    this.commit(state);
    return state.studio;
  }

  async listProjects(studioId: string): Promise<Project[]> {
    const state = this.read();
    return state.projects.filter((p) => p.studioId === studioId);
  }

  async getProjectBundleById(projectId: string): Promise<ProjectBundle | null> {
    const state = this.read();
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return null;
    return this.assembleBundle(state, project);
  }

  async getProjectBundleBySlugs(
    studioSlug: string,
    projectSlug: string
  ): Promise<ProjectBundle | null> {
    const state = this.read();
    if (state.studio.slug.toLowerCase() !== studioSlug.toLowerCase()) {
      return null;
    }
    const project = state.projects.find(
      (p) => p.slug.toLowerCase() === projectSlug.toLowerCase()
    );
    if (!project) return null;
    return this.assembleBundle(state, project);
  }

  private assembleBundle(state: SandboxDatabaseState, project: Project): ProjectBundle {
    return {
      studio: state.studio,
      project,
      milestones: state.milestones
        .filter((m) => m.projectId === project.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      deliverables: state.deliverables.filter((d) => d.projectId === project.id),
      invoices: state.invoices.filter((i) => i.projectId === project.id),
      activities: state.activities
        .filter((a) => a.projectId === project.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  }

  async createProject(studioId: string, input: CreateProjectInput): Promise<Project> {
    const state = this.read();
    const duplicate = state.projects.find(
      (p) => p.studioId === studioId && p.slug.toLowerCase() === input.slug.toLowerCase()
    );
    if (duplicate) {
      throw new Error("A project with this URL slug already exists.");
    }
    const now = new Date().toISOString();
    const project: Project = {
      id: `proj-${randomUUID().slice(0, 8)}`,
      studioId,
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      clientName: input.clientName,
      clientCompany: input.clientCompany,
      clientEmail: input.clientEmail,
      status: "active",
      passcodeHash: input.passcodeHash,
      passcodeSalt: input.passcodeSalt,
      passcodeVersion: 1,
      passcodeHint: input.passcodeHint,
      targetLaunchDate: input.targetLaunchDate,
      createdAt: now,
      updatedAt: now,
    };
    state.projects.unshift(project);
    this.appendActivity(state, {
      projectId: project.id,
      type: "project_created",
      actorName: state.studio.studioName,
      actorRole: "freelancer",
      message: `Initialized client portal for ${project.clientCompany}.`,
    });
    this.commit(state);
    return project;
  }

  async rotateProjectPasscode(
    projectId: string,
    passcodeHash: string,
    passcodeSalt: string,
    passcodeHint: string | null
  ): Promise<Project> {
    const state = this.read();
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found.");
    project.passcodeHash = passcodeHash;
    project.passcodeSalt = passcodeSalt;
    project.passcodeVersion += 1;
    project.passcodeHint = passcodeHint;
    project.updatedAt = new Date().toISOString();
    this.appendActivity(state, {
      projectId: project.id,
      type: "passcode_rotated",
      actorName: state.studio.studioName,
      actorRole: "freelancer",
      message: "Rotated portal password and revoked prior guest sessions.",
    });
    this.commit(state);
    return project;
  }

  async createMilestone(input: CreateMilestoneInput): Promise<Milestone> {
    const state = this.read();
    const existing = state.milestones.filter((m) => m.projectId === input.projectId);
    const now = new Date().toISOString();
    const milestone: Milestone = {
      id: `ms-${randomUUID().slice(0, 8)}`,
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      weightPct: input.weightPct,
      status: "planned",
      sortOrder: existing.length + 1,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    state.milestones.push(milestone);
    this.appendActivity(state, {
      projectId: input.projectId,
      type: "milestone_updated",
      actorName: state.studio.studioName,
      actorRole: "freelancer",
      message: `Added milestone "${milestone.title}" (${milestone.weightPct}% weight).`,
    });
    this.commit(state);
    return milestone;
  }

  async updateMilestoneStatus(
    projectId: string,
    milestoneId: string,
    status: MilestoneStatus
  ): Promise<Milestone> {
    const state = this.read();
    const milestone = state.milestones.find(
      (m) => m.id === milestoneId && m.projectId === projectId
    );
    if (!milestone) throw new Error("Milestone not found.");
    milestone.status = status;
    milestone.updatedAt = new Date().toISOString();
    this.appendActivity(state, {
      projectId,
      type: "milestone_updated",
      actorName: state.studio.studioName,
      actorRole: "freelancer",
      message: `Updated milestone "${milestone.title}" to ${status.replace("_", " ")}.`,
    });
    this.commit(state);
    return milestone;
  }

  async createDeliverable(input: CreateDeliverableInput): Promise<Deliverable> {
    const state = this.read();
    const now = new Date().toISOString();
    const deliverableId = `del-${randomUUID().slice(0, 8)}`;
    const versionId = `ver-${randomUUID().slice(0, 8)}`;
    const deliverable: Deliverable = {
      id: deliverableId,
      projectId: input.projectId,
      milestoneId: input.milestoneId,
      title: input.title,
      summary: input.summary,
      kind: input.kind,
      status: "in_review",
      currentVersion: 1,
      versions: [
        {
          id: versionId,
          deliverableId,
          versionNumber: 1,
          assetUrl: input.assetUrl,
          assetPublicId: input.assetPublicId,
          externalUrl: input.externalUrl,
          previewType: input.kind,
          releaseNotes: input.releaseNotes,
          fileSizeBytes: input.fileSizeBytes,
          createdAt: now,
        },
      ],
      approvals: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    };
    state.deliverables.unshift(deliverable);
    this.appendActivity(state, {
      projectId: input.projectId,
      type: "deliverable_published",
      actorName: state.studio.studioName,
      actorRole: "freelancer",
      message: `Published deliverable "${deliverable.title}" (v1) for client review.`,
    });
    this.commit(state);
    return deliverable;
  }

  async publishDeliverableVersion(input: PublishVersionInput): Promise<Deliverable> {
    const state = this.read();
    const deliverable = state.deliverables.find(
      (d) => d.id === input.deliverableId && d.projectId === input.projectId
    );
    if (!deliverable) throw new Error("Deliverable not found.");

    if (deliverable.status === "changes_requested" || deliverable.status === "draft") {
      assertDeliverableTransition(deliverable.status, "in_review");
    } else if (deliverable.status === "approved") {
      throw new Error("Approved deliverables are locked. Create a new deliverable instead.");
    }

    const nextVersion = deliverable.currentVersion + 1;
    const now = new Date().toISOString();
    deliverable.versions.push({
      id: `ver-${randomUUID().slice(0, 8)}`,
      deliverableId: deliverable.id,
      versionNumber: nextVersion,
      assetUrl: input.assetUrl,
      assetPublicId: input.assetPublicId,
      externalUrl: input.externalUrl,
      previewType: deliverable.kind,
      releaseNotes: input.releaseNotes,
      fileSizeBytes: input.fileSizeBytes,
      createdAt: now,
    });
    deliverable.currentVersion = nextVersion;
    deliverable.status = "in_review";
    deliverable.updatedAt = now;

    this.appendActivity(state, {
      projectId: input.projectId,
      type: "deliverable_version_added",
      actorName: state.studio.studioName,
      actorRole: "freelancer",
      message: `Uploaded v${nextVersion} of "${deliverable.title}".`,
    });
    this.commit(state);
    return deliverable;
  }

  async submitDeliverableDecision(input: SubmitDecisionInput): Promise<Deliverable> {
    const state = this.read();
    const deliverable = state.deliverables.find(
      (d) => d.id === input.deliverableId && d.projectId === input.projectId
    );
    if (!deliverable) throw new Error("Deliverable not found.");

    const version = deliverable.versions.find((v) => v.id === input.deliverableVersionId);
    if (!version) throw new Error("Deliverable version not found.");

    assertDeliverableTransition(deliverable.status, input.decision);

    const now = new Date().toISOString();
    deliverable.status = input.decision;
    deliverable.updatedAt = now;
    deliverable.approvals.unshift({
      id: `app-${randomUUID().slice(0, 8)}`,
      deliverableId: deliverable.id,
      deliverableVersionId: version.id,
      versionNumber: version.versionNumber,
      decision: input.decision,
      reviewerName: input.reviewerName,
      reviewerEmail: input.reviewerEmail,
      feedbackNote: input.feedbackNote,
      decidedAt: now,
    });

    this.appendActivity(state, {
      projectId: input.projectId,
      type:
        input.decision === "approved"
          ? "deliverable_approved"
          : "deliverable_changes_requested",
      actorName: input.reviewerName,
      actorRole: "client",
      message:
        input.decision === "approved"
          ? `Approved v${version.versionNumber} of "${deliverable.title}".`
          : `Requested revisions on v${version.versionNumber} of "${deliverable.title}".`,
    });

    this.commit(state);
    return deliverable;
  }

  async addDeliverableComment(input: AddCommentInput): Promise<DeliverableComment> {
    const state = this.read();
    const deliverable = state.deliverables.find(
      (d) => d.id === input.deliverableId && d.projectId === input.projectId
    );
    if (!deliverable) throw new Error("Deliverable not found.");

    const comment: DeliverableComment = {
      id: `cmt-${randomUUID().slice(0, 8)}`,
      deliverableId: deliverable.id,
      authorRole: input.authorRole,
      authorName: input.authorName,
      body: input.body,
      createdAt: new Date().toISOString(),
    };
    deliverable.comments.push(comment);
    deliverable.updatedAt = comment.createdAt;

    this.appendActivity(state, {
      projectId: input.projectId,
      type: "comment_posted",
      actorName: input.authorName,
      actorRole: input.authorRole,
      message: `Commented on "${deliverable.title}".`,
    });
    this.commit(state);
    return comment;
  }

  async listInvoicesForStudio(
    studioId: string
  ): Promise<Array<Invoice & { projectTitle: string; clientCompany: string }>> {
    const state = this.read();
    const projectMap = new Map(
      state.projects.filter((p) => p.studioId === studioId).map((p) => [p.id, p])
    );

    return state.invoices
      .filter((inv) => projectMap.has(inv.projectId))
      .map((inv) => {
        const project = projectMap.get(inv.projectId)!;
        return {
          ...inv,
          projectTitle: project.title,
          clientCompany: project.clientCompany,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getInvoiceWithContext(
    invoiceId: string
  ): Promise<{ invoice: Invoice; project: Project; studio: Studio } | null> {
    const state = this.read();
    const invoice = state.invoices.find((i) => i.id === invoiceId);
    if (!invoice) return null;
    const project = state.projects.find((p) => p.id === invoice.projectId);
    if (!project) return null;
    return { invoice, project, studio: state.studio };
  }

  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    const state = this.read();
    const totals = calculateInvoiceTotals(input.lineItems, input.taxBps);
    const now = new Date().toISOString();
    const seq = 101 + state.invoices.length;
    const prefix = state.studio.studioName
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 3) || "INV";

    const invoice: Invoice = {
      id: `inv-${randomUUID().slice(0, 8)}`,
      projectId: input.projectId,
      invoiceNumber: `${prefix}-${new Date().getUTCFullYear()}-${seq}`,
      title: input.title,
      status: input.status,
      currency: input.currency,
      subtotalCents: totals.subtotalCents,
      taxBps: totals.taxBps,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      lineItems: totals.lineItems,
      notes: input.notes,
      stripeInvoiceId: input.stripeInvoiceId ?? null,
      stripeHostedUrl: input.stripeHostedUrl ?? null,
      stripePdfUrl: input.stripePdfUrl ?? null,
      issueDate: now.slice(0, 10),
      dueDate: input.dueDate,
      paidAt: null,
      paymentMethodNote: null,
      createdAt: now,
      updatedAt: now,
    };

    state.invoices.unshift(invoice);
    this.appendActivity(state, {
      projectId: input.projectId,
      type: input.status === "sent" ? "invoice_sent" : "invoice_created",
      actorName: state.studio.studioName,
      actorRole: "freelancer",
      message: `${input.status === "sent" ? "Issued" : "Drafted"} invoice ${invoice.invoiceNumber}.`,
    });
    this.commit(state);
    return invoice;
  }

  async updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus,
    meta?: { paymentMethodNote?: string | null; paidAt?: string | null }
  ): Promise<Invoice> {
    const state = this.read();
    const invoice = state.invoices.find((i) => i.id === invoiceId);
    if (!invoice) throw new Error("Invoice not found.");

    assertInvoiceTransition(invoice.status, status);
    const now = new Date().toISOString();
    invoice.status = status;
    invoice.updatedAt = now;
    if (status === "paid") {
      invoice.paidAt = meta?.paidAt ?? now;
      invoice.paymentMethodNote = meta?.paymentMethodNote ?? "Recorded by studio";
    }

    this.appendActivity(state, {
      projectId: invoice.projectId,
      type:
        status === "paid"
          ? "invoice_paid"
          : status === "void"
            ? "invoice_voided"
            : "invoice_sent",
      actorName: state.studio.studioName,
      actorRole: "freelancer",
      message: `Marked invoice ${invoice.invoiceNumber} as ${status}.`,
    });
    this.commit(state);
    return invoice;
  }

  async markInvoicePaidByStripeId(stripeInvoiceId: string): Promise<Invoice | null> {
    const state = this.read();
    const invoice = state.invoices.find((i) => i.stripeInvoiceId === stripeInvoiceId);
    if (!invoice || invoice.status === "paid") return invoice ?? null;

    const now = new Date().toISOString();
    invoice.status = "paid";
    invoice.paidAt = now;
    invoice.paymentMethodNote = "Paid via Stripe Invoicing";
    invoice.updatedAt = now;

    this.appendActivity(state, {
      projectId: invoice.projectId,
      type: "invoice_paid",
      actorName: "Stripe",
      actorRole: "system",
      message: `Invoice ${invoice.invoiceNumber} settled via Stripe.`,
    });
    this.commit(state);
    return invoice;
  }

  async listRecentStudioActivities(
    studioId: string,
    limit = 12
  ): Promise<ActivityEvent[]> {
    const state = this.read();
    const projectIds = new Set(
      state.projects.filter((p) => p.studioId === studioId).map((p) => p.id)
    );
    return state.activities
      .filter((a) => projectIds.has(a.projectId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}
