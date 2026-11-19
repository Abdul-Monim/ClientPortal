export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export type MilestoneStatus = "planned" | "in_progress" | "in_review" | "approved";

export type DeliverableKind =
  | "image"
  | "pdf"
  | "video"
  | "archive"
  | "figma"
  | "staging_url"
  | "loom"
  | "document"
  | "link";

export type DeliverableStatus = "draft" | "in_review" | "changes_requested" | "approved";

export type ApprovalDecision = "approved" | "changes_requested";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export type ActivityType =
  | "project_created"
  | "passcode_rotated"
  | "milestone_updated"
  | "deliverable_published"
  | "deliverable_version_added"
  | "deliverable_approved"
  | "deliverable_changes_requested"
  | "comment_posted"
  | "invoice_created"
  | "invoice_sent"
  | "invoice_paid"
  | "invoice_voided";

export interface Studio {
  id: string;
  ownerUserId: string;
  slug: string;
  customDomain: string | null;
  studioName: string;
  tagline: string;
  logoUrl: string | null;
  accentHex: string;
  welcomeMessage: string;
  contactEmail: string;
  billingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  studioId: string;
  slug: string;
  title: string;
  summary: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  status: ProjectStatus;
  passcodeHash: string;
  passcodeSalt: string;
  passcodeVersion: number;
  passcodeHint: string | null;
  targetLaunchDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  weightPct: number;
  status: MilestoneStatus;
  sortOrder: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverableVersion {
  id: string;
  deliverableId: string;
  versionNumber: number;
  assetUrl: string | null;
  assetPublicId: string | null;
  externalUrl: string | null;
  previewType: DeliverableKind;
  releaseNotes: string;
  fileSizeBytes: number | null;
  createdAt: string;
}

export interface ApprovalRecord {
  id: string;
  deliverableId: string;
  deliverableVersionId: string;
  versionNumber: number;
  decision: ApprovalDecision;
  reviewerName: string;
  reviewerEmail: string | null;
  feedbackNote: string;
  decidedAt: string;
}

export interface DeliverableComment {
  id: string;
  deliverableId: string;
  authorRole: "freelancer" | "client";
  authorName: string;
  body: string;
  createdAt: string;
}

export interface Deliverable {
  id: string;
  projectId: string;
  milestoneId: string | null;
  title: string;
  summary: string;
  kind: DeliverableKind;
  status: DeliverableStatus;
  currentVersion: number;
  versions: DeliverableVersion[];
  approvals: ApprovalRecord[];
  comments: DeliverableComment[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmountCents: number;
  amountCents: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  title: string;
  status: InvoiceStatus;
  currency: string;
  subtotalCents: number;
  taxBps: number;
  taxCents: number;
  totalCents: number;
  lineItems: InvoiceLineItem[];
  notes: string;
  stripeInvoiceId: string | null;
  stripeHostedUrl: string | null;
  stripePdfUrl: string | null;
  issueDate: string;
  dueDate: string;
  paidAt: string | null;
  paymentMethodNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEvent {
  id: string;
  projectId: string;
  type: ActivityType;
  actorName: string;
  actorRole: "freelancer" | "client" | "system";
  message: string;
  createdAt: string;
}

export interface ProjectBundle {
  studio: Studio;
  project: Project;
  milestones: Milestone[];
  deliverables: Deliverable[];
  invoices: Invoice[];
  activities: ActivityEvent[];
}

export interface PublicStudioProjectMeta {
  studio: Studio;
  project: Pick<
    Project,
    | "id"
    | "studioId"
    | "slug"
    | "title"
    | "summary"
    | "clientName"
    | "clientCompany"
    | "status"
    | "passcodeVersion"
    | "passcodeHint"
    | "targetLaunchDate"
  >;
}
