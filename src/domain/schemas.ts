import { z } from "zod";

export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Accent color must be a valid 6-digit hex code.");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Slug must be at least 2 characters.")
  .max(60, "Slug must be at most 60 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and single hyphens only."
  );

export const freelancerLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid studio email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const freelancerSignupSchema = z.object({
  email: z.string().trim().email("Enter a valid studio email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  studioName: z.string().trim().min(2, "Studio or freelance brand name is required.").max(80),
  studioSlug: slugSchema.optional(),
});

export const updateStudioSchema = z.object({
  studioName: z.string().trim().min(2, "Studio name is required.").max(80),
  slug: slugSchema,
  customDomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^([a-z0-9-]+\.)+[a-z]{2,}$/,
      "Enter a valid domain like client.yourname.com"
    )
    .optional()
    .or(z.literal("")),
  tagline: z.string().trim().max(140).default(""),
  logoUrl: z
    .string()
    .trim()
    .url("Logo URL must be a valid https URL.")
    .optional()
    .or(z.literal("")),
  accentHex: hexColorSchema,
  welcomeMessage: z.string().trim().min(5).max(400),
  contactEmail: z.string().trim().email("Enter a valid contact email."),
  billingAddress: z.string().trim().max(240).default(""),
});

export const createProjectSchema = z.object({
  title: z.string().trim().min(2, "Project title is required.").max(100),
  slug: slugSchema,
  summary: z.string().trim().max(400).default(""),
  clientName: z.string().trim().min(2, "Client name is required.").max(80),
  clientCompany: z.string().trim().min(1, "Client company is required.").max(80),
  clientEmail: z.string().trim().email("Enter a valid client email."),
  passcode: z
    .string()
    .trim()
    .min(4, "Portal password must be at least 4 characters.")
    .max(64),
  passcodeHint: z.string().trim().max(120).optional().or(z.literal("")),
  targetLaunchDate: z.string().trim().optional().or(z.literal("")),
});

export const rotatePasscodeSchema = z.object({
  projectId: z.string().min(1),
  newPasscode: z
    .string()
    .trim()
    .min(4, "Portal password must be at least 4 characters.")
    .max(64),
  passcodeHint: z.string().trim().max(120).optional().or(z.literal("")),
});

export const createMilestoneSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(2, "Milestone title is required.").max(100),
  description: z.string().trim().max(300).default(""),
  weightPct: z.coerce.number().int().min(1).max(100),
  dueDate: z.string().trim().optional().or(z.literal("")),
});

export const updateMilestoneStatusSchema = z.object({
  projectId: z.string().min(1),
  milestoneId: z.string().min(1),
  status: z.enum(["planned", "in_progress", "in_review", "approved"]),
});

export const createDeliverableSchema = z
  .object({
    projectId: z.string().min(1),
    milestoneId: z.string().optional().or(z.literal("")),
    title: z.string().trim().min(2, "Deliverable title is required.").max(120),
    summary: z.string().trim().max(500).default(""),
    kind: z.enum([
      "image",
      "pdf",
      "video",
      "archive",
      "figma",
      "staging_url",
      "loom",
      "document",
      "link",
    ]),
    assetUrl: z.string().trim().url().optional().or(z.literal("")),
    assetPublicId: z.string().trim().optional().or(z.literal("")),
    externalUrl: z.string().trim().url().optional().or(z.literal("")),
    releaseNotes: z.string().trim().max(400).default("Initial version ready for review."),
    fileSizeBytes: z.coerce.number().int().nonnegative().optional(),
  })
  .refine((data) => Boolean(data.assetUrl || data.externalUrl), {
    message: "Attach a file upload or paste a design/staging link.",
    path: ["externalUrl"],
  });

export const publishDeliverableVersionSchema = z
  .object({
    projectId: z.string().min(1),
    deliverableId: z.string().min(1),
    assetUrl: z.string().trim().url().optional().or(z.literal("")),
    assetPublicId: z.string().trim().optional().or(z.literal("")),
    externalUrl: z.string().trim().url().optional().or(z.literal("")),
    releaseNotes: z.string().trim().min(2, "Add a brief note about what changed.").max(400),
    fileSizeBytes: z.coerce.number().int().nonnegative().optional(),
  })
  .refine((data) => Boolean(data.assetUrl || data.externalUrl), {
    message: "Provide an updated file URL or external link.",
    path: ["externalUrl"],
  });

export const clientPasscodeAuthSchema = z.object({
  studioSlug: slugSchema,
  projectSlug: slugSchema,
  passcode: z.string().trim().min(1, "Enter your portal password.").max(64),
});

export const deliverableDecisionSchema = z
  .object({
    deliverableVersionId: z.string().min(1),
    decision: z.enum(["approved", "changes_requested"]),
    reviewerName: z.string().trim().min(2, "Please enter your full name.").max(80),
    reviewerEmail: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .optional()
      .or(z.literal("")),
    feedbackNote: z.string().trim().max(600).default(""),
  })
  .refine(
    (data) =>
      data.decision !== "changes_requested" || data.feedbackNote.trim().length >= 4,
    {
      message: "Please describe the changes you need before requesting revisions.",
      path: ["feedbackNote"],
    }
  );

export const deliverableCommentSchema = z.object({
  authorName: z.string().trim().min(2, "Enter your name.").max(80),
  body: z.string().trim().min(1, "Write a comment before posting.").max(1000),
});

export const invoiceLineItemInputSchema = z.object({
  description: z.string().trim().min(2, "Line item description is required.").max(160),
  quantity: z.coerce.number().int().min(1).max(1000),
  unitAmountDollars: z.coerce.number().min(0.01, "Amount must be greater than zero."),
});

export const createInvoiceSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(2, "Invoice title is required.").max(120),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]).default("USD"),
  taxPercent: z.coerce.number().min(0).max(50).default(0),
  dueDate: z.string().trim().min(8, "Due date is required."),
  notes: z.string().trim().max(400).default(""),
  issueImmediately: z.boolean().default(true),
  lineItems: z.array(invoiceLineItemInputSchema).min(1, "Add at least one line item."),
});
