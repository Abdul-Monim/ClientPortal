import { calculateInvoiceTotals } from "@/domain/money";
import {
  assertDeliverableTransition,
  assertInvoiceTransition,
} from "@/domain/state-machines";
import { normalizeAccentHex } from "@/domain/theme";
import type {
  ActivityEvent,
  ApprovalRecord,
  Deliverable,
  DeliverableComment,
  DeliverableVersion,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  Milestone,
  MilestoneStatus,
  Project,
  ProjectBundle,
  Studio,
} from "@/domain/types";
import { createSupabaseAdminClient } from "./supabase-client";
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

type Row = Record<string, unknown>;

function mapStudio(row: Row): Studio {
  return {
    id: String(row.id),
    ownerUserId: String(row.owner_user_id),
    slug: String(row.slug),
    customDomain: (row.custom_domain as string | null) ?? null,
    studioName: String(row.studio_name),
    tagline: String(row.tagline ?? ""),
    logoUrl: (row.logo_url as string | null) ?? null,
    accentHex: String(row.accent_hex ?? "#2F5D50"),
    welcomeMessage: String(row.welcome_message ?? ""),
    contactEmail: String(row.contact_email ?? ""),
    billingAddress: String(row.billing_address ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapProject(row: Row): Project {
  return {
    id: String(row.id),
    studioId: String(row.studio_id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary ?? ""),
    clientName: String(row.client_name),
    clientCompany: String(row.client_company),
    clientEmail: String(row.client_email),
    status: row.status as Project["status"],
    passcodeHash: String(row.passcode_hash),
    passcodeSalt: String(row.passcode_salt),
    passcodeVersion: Number(row.passcode_version ?? 1),
    passcodeHint: (row.passcode_hint as string | null) ?? null,
    targetLaunchDate: (row.target_launch_date as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapMilestone(row: Row): Milestone {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    title: String(row.title),
    description: String(row.description ?? ""),
    weightPct: Number(row.weight_pct ?? 0),
    status: row.status as MilestoneStatus,
    sortOrder: Number(row.sort_order ?? 0),
    dueDate: (row.due_date as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapVersion(row: Row): DeliverableVersion {
  return {
    id: String(row.id),
    deliverableId: String(row.deliverable_id),
    versionNumber: Number(row.version_number),
    assetUrl: (row.asset_url as string | null) ?? null,
    assetPublicId: (row.asset_public_id as string | null) ?? null,
    externalUrl: (row.external_url as string | null) ?? null,
    previewType: row.preview_type as DeliverableVersion["previewType"],
    releaseNotes: String(row.release_notes ?? ""),
    fileSizeBytes: row.file_size_bytes == null ? null : Number(row.file_size_bytes),
    createdAt: String(row.created_at),
  };
}

function mapApproval(row: Row): ApprovalRecord {
  return {
    id: String(row.id),
    deliverableId: String(row.deliverable_id),
    deliverableVersionId: String(row.deliverable_version_id),
    versionNumber: Number(row.version_number),
    decision: row.decision as ApprovalRecord["decision"],
    reviewerName: String(row.reviewer_name),
    reviewerEmail: (row.reviewer_email as string | null) ?? null,
    feedbackNote: String(row.feedback_note ?? ""),
    decidedAt: String(row.decided_at),
  };
}

function mapComment(row: Row): DeliverableComment {
  return {
    id: String(row.id),
    deliverableId: String(row.deliverable_id),
    authorRole: row.author_role as DeliverableComment["authorRole"],
    authorName: String(row.author_name),
    body: String(row.body),
    createdAt: String(row.created_at),
  };
}

function mapLineItem(row: Row): InvoiceLineItem {
  return {
    id: String(row.id),
    description: String(row.description),
    quantity: Number(row.quantity),
    unitAmountCents: Number(row.unit_amount_cents),
    amountCents: Number(row.amount_cents),
  };
}

function mapInvoice(row: Row, lineItems: InvoiceLineItem[]): Invoice {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    invoiceNumber: String(row.invoice_number),
    title: String(row.title),
    status: row.status as InvoiceStatus,
    currency: String(row.currency ?? "USD"),
    subtotalCents: Number(row.subtotal_cents),
    taxBps: Number(row.tax_bps ?? 0),
    taxCents: Number(row.tax_cents ?? 0),
    totalCents: Number(row.total_cents),
    lineItems,
    notes: String(row.notes ?? ""),
    stripeInvoiceId: (row.stripe_invoice_id as string | null) ?? null,
    stripeHostedUrl: (row.stripe_hosted_url as string | null) ?? null,
    stripePdfUrl: (row.stripe_pdf_url as string | null) ?? null,
    issueDate: String(row.issue_date),
    dueDate: String(row.due_date),
    paidAt: (row.paid_at as string | null) ?? null,
    paymentMethodNote: (row.payment_method_note as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapActivity(row: Row): ActivityEvent {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    type: row.type as ActivityEvent["type"],
    actorName: String(row.actor_name),
    actorRole: row.actor_role as ActivityEvent["actorRole"],
    message: String(row.message),
    createdAt: String(row.created_at),
  };
}

export class SupabasePortalRepository implements PortalRepository {
  private db() {
    return createSupabaseAdminClient();
  }

  async getStudioForOwner(ownerUserId?: string): Promise<Studio> {
    const db = this.db();
    const query = ownerUserId
      ? db.from("studios").select("*").eq("owner_user_id", ownerUserId).maybeSingle()
      : db.from("studios").select("*").limit(1).maybeSingle();

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (!data) {
      throw new Error("No studio profile exists yet for this account.");
    }
    return mapStudio(data as Row);
  }

  async getStudioBySlug(slug: string): Promise<Studio | null> {
    const { data, error } = await this.db()
      .from("studios")
      .select("*")
      .eq("slug", slug.toLowerCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapStudio(data as Row) : null;
  }

  async getStudioByCustomDomain(domain: string): Promise<Studio | null> {
    const target = domain.toLowerCase();
    const { data, error } = await this.db()
      .from("studios")
      .select("*")
      .eq("custom_domain", target)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return mapStudio(data as Row);

    const subdomain = target.split(".")[0];
    if (subdomain) {
      return this.getStudioBySlug(subdomain);
    }
    return null;
  }

  async updateStudio(studioId: string, input: UpdateStudioInput): Promise<Studio> {
    const { data, error } = await this.db()
      .from("studios")
      .update({
        studio_name: input.studioName,
        slug: input.slug,
        custom_domain: input.customDomain,
        tagline: input.tagline,
        logo_url: input.logoUrl,
        accent_hex: normalizeAccentHex(input.accentHex),
        welcome_message: input.welcomeMessage,
        contact_email: input.contactEmail,
        billing_address: input.billingAddress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", studioId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapStudio(data as Row);
  }

  async listProjects(studioId: string): Promise<Project[]> {
    const { data, error } = await this.db()
      .from("projects")
      .select("*")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapProject(row as Row));
  }

  async getProjectBundleById(projectId: string): Promise<ProjectBundle | null> {
    const { data: projectRow, error } = await this.db()
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!projectRow) return null;
    return this.loadBundleForProject(mapProject(projectRow as Row));
  }

  async getProjectBundleBySlugs(
    studioSlug: string,
    projectSlug: string
  ): Promise<ProjectBundle | null> {
    const studio = await this.getStudioBySlug(studioSlug);
    if (!studio) return null;

    const { data: projectRow, error } = await this.db()
      .from("projects")
      .select("*")
      .eq("studio_id", studio.id)
      .eq("slug", projectSlug.toLowerCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!projectRow) return null;

    return this.loadBundleForProject(mapProject(projectRow as Row), studio);
  }

  private async loadBundleForProject(
    project: Project,
    studioOverride?: Studio
  ): Promise<ProjectBundle> {
    const db = this.db();
    const [studioRes, msRes, delRes, invRes, actRes] = await Promise.all([
      studioOverride
        ? Promise.resolve({ data: null, error: null })
        : db.from("studios").select("*").eq("id", project.studioId).single(),
      db
        .from("milestones")
        .select("*")
        .eq("project_id", project.id)
        .order("sort_order", { ascending: true }),
      db
        .from("deliverables")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false }),
      db
        .from("invoices")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false }),
      db
        .from("activity_events")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    if (studioRes.error) throw new Error(studioRes.error.message);
    const studio = studioOverride ?? mapStudio(studioRes.data as Row);

    const deliverableRows = (delRes.data ?? []) as Row[];
    const deliverableIds = deliverableRows.map((d) => String(d.id));
    const [verRes, appRes, cmtRes] = deliverableIds.length
      ? await Promise.all([
          db
            .from("deliverable_versions")
            .select("*")
            .in("deliverable_id", deliverableIds)
            .order("version_number", { ascending: true }),
          db
            .from("approval_records")
            .select("*")
            .in("deliverable_id", deliverableIds)
            .order("decided_at", { ascending: false }),
          db
            .from("deliverable_comments")
            .select("*")
            .in("deliverable_id", deliverableIds)
            .order("created_at", { ascending: true }),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }];

    const versions = (verRes.data ?? []).map((r) => mapVersion(r as Row));
    const approvals = (appRes.data ?? []).map((r) => mapApproval(r as Row));
    const comments = (cmtRes.data ?? []).map((r) => mapComment(r as Row));

    const deliverables: Deliverable[] = deliverableRows.map((row) => {
      const id = String(row.id);
      return {
        id,
        projectId: String(row.project_id),
        milestoneId: (row.milestone_id as string | null) ?? null,
        title: String(row.title),
        summary: String(row.summary ?? ""),
        kind: row.kind as Deliverable["kind"],
        status: row.status as Deliverable["status"],
        currentVersion: Number(row.current_version ?? 1),
        versions: versions.filter((v) => v.deliverableId === id),
        approvals: approvals.filter((a) => a.deliverableId === id),
        comments: comments.filter((c) => c.deliverableId === id),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
      };
    });

    const invoiceRows = (invRes.data ?? []) as Row[];
    const invoiceIds = invoiceRows.map((i) => String(i.id));
    const liRes = invoiceIds.length
      ? await db
          .from("invoice_line_items")
          .select("*")
          .in("invoice_id", invoiceIds)
          .order("sort_order", { ascending: true })
      : { data: [] };
    const lineItemRows = (liRes.data ?? []) as Row[];

    const invoices = invoiceRows.map((row) =>
      mapInvoice(
        row,
        lineItemRows
          .filter((li) => String(li.invoice_id) === String(row.id))
          .map(mapLineItem)
      )
    );

    return {
      studio,
      project,
      milestones: (msRes.data ?? []).map((r) => mapMilestone(r as Row)),
      deliverables,
      invoices,
      activities: (actRes.data ?? []).map((r) => mapActivity(r as Row)),
    };
  }

  async createProject(studioId: string, input: CreateProjectInput): Promise<Project> {
    const { data, error } = await this.db()
      .from("projects")
      .insert({
        studio_id: studioId,
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        client_name: input.clientName,
        client_company: input.clientCompany,
        client_email: input.clientEmail,
        passcode_hash: input.passcodeHash,
        passcode_salt: input.passcodeSalt,
        passcode_hint: input.passcodeHint,
        target_launch_date: input.targetLaunchDate,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapProject(data as Row);
  }

  async rotateProjectPasscode(
    projectId: string,
    passcodeHash: string,
    passcodeSalt: string,
    passcodeHint: string | null
  ): Promise<Project> {
    const db = this.db();
    const { data: current, error: readErr } = await db
      .from("projects")
      .select("passcode_version")
      .eq("id", projectId)
      .single();
    if (readErr) throw new Error(readErr.message);

    const { data, error } = await db
      .from("projects")
      .update({
        passcode_hash: passcodeHash,
        passcode_salt: passcodeSalt,
        passcode_version: Number(current.passcode_version ?? 1) + 1,
        passcode_hint: passcodeHint,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapProject(data as Row);
  }

  async createMilestone(input: CreateMilestoneInput): Promise<Milestone> {
    const db = this.db();
    const { count } = await db
      .from("milestones")
      .select("*", { count: "exact", head: true })
      .eq("project_id", input.projectId);

    const { data, error } = await db
      .from("milestones")
      .insert({
        project_id: input.projectId,
        title: input.title,
        description: input.description,
        weight_pct: input.weightPct,
        sort_order: (count ?? 0) + 1,
        due_date: input.dueDate,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapMilestone(data as Row);
  }

  async updateMilestoneStatus(
    projectId: string,
    milestoneId: string,
    status: MilestoneStatus
  ): Promise<Milestone> {
    const { data, error } = await this.db()
      .from("milestones")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", milestoneId)
      .eq("project_id", projectId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapMilestone(data as Row);
  }

  async createDeliverable(input: CreateDeliverableInput): Promise<Deliverable> {
    const db = this.db();
    const { data: delRow, error: delErr } = await db
      .from("deliverables")
      .insert({
        project_id: input.projectId,
        milestone_id: input.milestoneId,
        title: input.title,
        summary: input.summary,
        kind: input.kind,
        status: "in_review",
        current_version: 1,
      })
      .select("*")
      .single();
    if (delErr) throw new Error(delErr.message);

    const { data: verRow, error: verErr } = await db
      .from("deliverable_versions")
      .insert({
        deliverable_id: delRow.id,
        version_number: 1,
        asset_url: input.assetUrl,
        asset_public_id: input.assetPublicId,
        external_url: input.externalUrl,
        preview_type: input.kind,
        release_notes: input.releaseNotes,
        file_size_bytes: input.fileSizeBytes,
      })
      .select("*")
      .single();
    if (verErr) throw new Error(verErr.message);

    return {
      id: String(delRow.id),
      projectId: String(delRow.project_id),
      milestoneId: (delRow.milestone_id as string | null) ?? null,
      title: String(delRow.title),
      summary: String(delRow.summary ?? ""),
      kind: delRow.kind as Deliverable["kind"],
      status: "in_review",
      currentVersion: 1,
      versions: [mapVersion(verRow as Row)],
      approvals: [],
      comments: [],
      createdAt: String(delRow.created_at),
      updatedAt: String(delRow.updated_at),
    };
  }

  async publishDeliverableVersion(input: PublishVersionInput): Promise<Deliverable> {
    const db = this.db();
    const { data: current, error: curErr } = await db
      .from("deliverables")
      .select("*")
      .eq("id", input.deliverableId)
      .eq("project_id", input.projectId)
      .single();
    if (curErr) throw new Error(curErr.message);

    if (current.status === "changes_requested" || current.status === "draft") {
      assertDeliverableTransition(current.status, "in_review");
    } else if (current.status === "approved") {
      throw new Error("Approved deliverables are locked.");
    }

    const nextVersion = Number(current.current_version) + 1;
    const { error: verErr } = await db.from("deliverable_versions").insert({
      deliverable_id: input.deliverableId,
      version_number: nextVersion,
      asset_url: input.assetUrl,
      asset_public_id: input.assetPublicId,
      external_url: input.externalUrl,
      preview_type: current.kind,
      release_notes: input.releaseNotes,
      file_size_bytes: input.fileSizeBytes,
    });
    if (verErr) throw new Error(verErr.message);

    await db
      .from("deliverables")
      .update({
        current_version: nextVersion,
        status: "in_review",
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.deliverableId);

    const bundle = await this.getProjectBundleById(input.projectId);
    const updated = bundle?.deliverables.find((d) => d.id === input.deliverableId);
    if (!updated) throw new Error("Deliverable not found after update.");
    return updated;
  }

  async submitDeliverableDecision(input: SubmitDecisionInput): Promise<Deliverable> {
    const db = this.db();
    const { data: current, error: curErr } = await db
      .from("deliverables")
      .select("*")
      .eq("id", input.deliverableId)
      .eq("project_id", input.projectId)
      .single();
    if (curErr) throw new Error(curErr.message);

    assertDeliverableTransition(current.status, input.decision);

    const { data: verRow, error: verErr } = await db
      .from("deliverable_versions")
      .select("version_number")
      .eq("id", input.deliverableVersionId)
      .single();
    if (verErr) throw new Error(verErr.message);

    await db.from("approval_records").insert({
      deliverable_id: input.deliverableId,
      deliverable_version_id: input.deliverableVersionId,
      version_number: verRow.version_number,
      decision: input.decision,
      reviewer_name: input.reviewerName,
      reviewer_email: input.reviewerEmail,
      feedback_note: input.feedbackNote,
    });

    await db
      .from("deliverables")
      .update({ status: input.decision, updated_at: new Date().toISOString() })
      .eq("id", input.deliverableId);

    await db.from("activity_events").insert({
      project_id: input.projectId,
      type:
        input.decision === "approved"
          ? "deliverable_approved"
          : "deliverable_changes_requested",
      actor_name: input.reviewerName,
      actor_role: "client",
      message:
        input.decision === "approved"
          ? `Approved v${verRow.version_number} of "${current.title}".`
          : `Requested revisions on v${verRow.version_number} of "${current.title}".`,
    });

    const bundle = await this.getProjectBundleById(input.projectId);
    const updated = bundle?.deliverables.find((d) => d.id === input.deliverableId);
    if (!updated) throw new Error("Deliverable not found.");
    return updated;
  }

  async addDeliverableComment(input: AddCommentInput): Promise<DeliverableComment> {
    const { data, error } = await this.db()
      .from("deliverable_comments")
      .insert({
        deliverable_id: input.deliverableId,
        author_role: input.authorRole,
        author_name: input.authorName,
        body: input.body,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapComment(data as Row);
  }

  async listInvoicesForStudio(
    studioId: string
  ): Promise<Array<Invoice & { projectTitle: string; clientCompany: string }>> {
    const projects = await this.listProjects(studioId);
    if (projects.length === 0) return [];
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    const db = this.db();
    const { data: invRows, error } = await db
      .from("invoices")
      .select("*")
      .in("project_id", Array.from(projectMap.keys()))
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (invRows ?? []).map((r) => String(r.id));
    const { data: liRows } = ids.length
      ? await db.from("invoice_line_items").select("*").in("invoice_id", ids)
      : { data: [] };

    return (invRows ?? []).map((row) => {
      const r = row as Row;
      const project = projectMap.get(String(r.project_id))!;
      const inv = mapInvoice(
        r,
        ((liRows ?? []) as Row[])
          .filter((li) => String(li.invoice_id) === String(r.id))
          .map(mapLineItem)
      );
      return {
        ...inv,
        projectTitle: project.title,
        clientCompany: project.clientCompany,
      };
    });
  }

  async getInvoiceWithContext(
    invoiceId: string
  ): Promise<{ invoice: Invoice; project: Project; studio: Studio } | null> {
    const db = this.db();
    const { data: invRow } = await db
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();
    if (!invRow) return null;

    const [{ data: liRows }, { data: projRow }] = await Promise.all([
      db.from("invoice_line_items").select("*").eq("invoice_id", invoiceId),
      db.from("projects").select("*").eq("id", invRow.project_id).single(),
    ]);
    if (!projRow) return null;

    const { data: studioRow } = await db
      .from("studios")
      .select("*")
      .eq("id", projRow.studio_id)
      .single();
    if (!studioRow) return null;

    return {
      invoice: mapInvoice(invRow as Row, ((liRows ?? []) as Row[]).map(mapLineItem)),
      project: mapProject(projRow as Row),
      studio: mapStudio(studioRow as Row),
    };
  }

  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    const db = this.db();
    const totals = calculateInvoiceTotals(input.lineItems, input.taxBps);
    const invoiceNumber = `INV-${new Date().getUTCFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: invRow, error: invErr } = await db
      .from("invoices")
      .insert({
        project_id: input.projectId,
        invoice_number: invoiceNumber,
        title: input.title,
        status: input.status,
        currency: input.currency,
        subtotal_cents: totals.subtotalCents,
        tax_bps: totals.taxBps,
        tax_cents: totals.taxCents,
        total_cents: totals.totalCents,
        notes: input.notes,
        due_date: input.dueDate,
        stripe_invoice_id: input.stripeInvoiceId ?? null,
        stripe_hosted_url: input.stripeHostedUrl ?? null,
        stripe_pdf_url: input.stripePdfUrl ?? null,
      })
      .select("*")
      .single();
    if (invErr) throw new Error(invErr.message);

    const { data: liRows, error: liErr } = await db
      .from("invoice_line_items")
      .insert(
        totals.lineItems.map((item, idx) => ({
          invoice_id: invRow.id,
          description: item.description,
          quantity: item.quantity,
          unit_amount_cents: item.unitAmountCents,
          amount_cents: item.amountCents,
          sort_order: idx,
        }))
      )
      .select("*");
    if (liErr) throw new Error(liErr.message);

    return mapInvoice(invRow as Row, ((liRows ?? []) as Row[]).map(mapLineItem));
  }

  async updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus,
    meta?: { paymentMethodNote?: string | null; paidAt?: string | null }
  ): Promise<Invoice> {
    const db = this.db();
    const existing = await this.getInvoiceWithContext(invoiceId);
    if (!existing) throw new Error("Invoice not found.");

    assertInvoiceTransition(existing.invoice.status, status);
    const now = new Date().toISOString();
    const { data, error } = await db
      .from("invoices")
      .update({
        status,
        paid_at: status === "paid" ? meta?.paidAt ?? now : existing.invoice.paidAt,
        payment_method_note:
          status === "paid"
            ? meta?.paymentMethodNote ?? "Recorded by studio"
            : existing.invoice.paymentMethodNote,
        updated_at: now,
      })
      .eq("id", invoiceId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    return mapInvoice(data as Row, existing.invoice.lineItems);
  }

  async markInvoicePaidByStripeId(stripeInvoiceId: string): Promise<Invoice | null> {
    const db = this.db();
    const { data: invRow } = await db
      .from("invoices")
      .select("id")
      .eq("stripe_invoice_id", stripeInvoiceId)
      .maybeSingle();
    if (!invRow) return null;
    return this.updateInvoiceStatus(String(invRow.id), "paid", {
      paymentMethodNote: "Paid via Stripe Invoicing",
    });
  }

  async listRecentStudioActivities(
    studioId: string,
    limit = 12
  ): Promise<ActivityEvent[]> {
    const projects = await this.listProjects(studioId);
    if (projects.length === 0) return [];
    const { data, error } = await this.db()
      .from("activity_events")
      .select("*")
      .in(
        "project_id",
        projects.map((p) => p.id)
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => mapActivity(r as Row));
  }
}
