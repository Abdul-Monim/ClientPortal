import type {
  ActivityEvent,
  ApprovalDecision,
  Deliverable,
  DeliverableComment,
  DeliverableKind,
  Invoice,
  InvoiceStatus,
  Milestone,
  MilestoneStatus,
  Project,
  ProjectBundle,
  Studio,
} from "@/domain/types";
import type { LineItemDraft } from "@/domain/money";

export interface UpdateStudioInput {
  studioName: string;
  slug: string;
  customDomain: string | null;
  tagline: string;
  logoUrl: string | null;
  accentHex: string;
  welcomeMessage: string;
  contactEmail: string;
  billingAddress: string;
}

export interface CreateProjectInput {
  title: string;
  slug: string;
  summary: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  passcodeHash: string;
  passcodeSalt: string;
  passcodeHint: string | null;
  targetLaunchDate: string | null;
}

export interface CreateMilestoneInput {
  projectId: string;
  title: string;
  description: string;
  weightPct: number;
  dueDate: string | null;
}

export interface CreateDeliverableInput {
  projectId: string;
  milestoneId: string | null;
  title: string;
  summary: string;
  kind: DeliverableKind;
  assetUrl: string | null;
  assetPublicId: string | null;
  externalUrl: string | null;
  releaseNotes: string;
  fileSizeBytes: number | null;
}

export interface PublishVersionInput {
  projectId: string;
  deliverableId: string;
  assetUrl: string | null;
  assetPublicId: string | null;
  externalUrl: string | null;
  releaseNotes: string;
  fileSizeBytes: number | null;
}

export interface SubmitDecisionInput {
  projectId: string;
  deliverableId: string;
  deliverableVersionId: string;
  decision: ApprovalDecision;
  reviewerName: string;
  reviewerEmail: string | null;
  feedbackNote: string;
}

export interface AddCommentInput {
  projectId: string;
  deliverableId: string;
  authorRole: "freelancer" | "client";
  authorName: string;
  body: string;
}

export interface CreateInvoiceInput {
  projectId: string;
  title: string;
  currency: string;
  taxBps: number;
  lineItems: LineItemDraft[];
  notes: string;
  dueDate: string;
  status: Extract<InvoiceStatus, "draft" | "sent">;
  stripeInvoiceId?: string | null;
  stripeHostedUrl?: string | null;
  stripePdfUrl?: string | null;
}

export interface PortalRepository {
  getStudioForOwner(ownerUserId?: string): Promise<Studio>;
  getStudioBySlug(slug: string): Promise<Studio | null>;
  getStudioByCustomDomain(domain: string): Promise<Studio | null>;
  updateStudio(studioId: string, input: UpdateStudioInput): Promise<Studio>;

  listProjects(studioId: string): Promise<Project[]>;
  getProjectBundleById(projectId: string): Promise<ProjectBundle | null>;
  getProjectBundleBySlugs(
    studioSlug: string,
    projectSlug: string
  ): Promise<ProjectBundle | null>;
  createProject(studioId: string, input: CreateProjectInput): Promise<Project>;
  rotateProjectPasscode(
    projectId: string,
    passcodeHash: string,
    passcodeSalt: string,
    passcodeHint: string | null
  ): Promise<Project>;

  createMilestone(input: CreateMilestoneInput): Promise<Milestone>;
  updateMilestoneStatus(
    projectId: string,
    milestoneId: string,
    status: MilestoneStatus
  ): Promise<Milestone>;

  createDeliverable(input: CreateDeliverableInput): Promise<Deliverable>;
  publishDeliverableVersion(input: PublishVersionInput): Promise<Deliverable>;
  submitDeliverableDecision(input: SubmitDecisionInput): Promise<Deliverable>;
  addDeliverableComment(input: AddCommentInput): Promise<DeliverableComment>;

  listInvoicesForStudio(studioId: string): Promise<Array<Invoice & { projectTitle: string; clientCompany: string }>>;
  getInvoiceWithContext(
    invoiceId: string
  ): Promise<{ invoice: Invoice; project: Project; studio: Studio } | null>;
  createInvoice(input: CreateInvoiceInput): Promise<Invoice>;
  updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus,
    meta?: { paymentMethodNote?: string | null; paidAt?: string | null }
  ): Promise<Invoice>;
  markInvoicePaidByStripeId(stripeInvoiceId: string): Promise<Invoice | null>;

  listRecentStudioActivities(studioId: string, limit?: number): Promise<ActivityEvent[]>;
}
