import { Resend } from "resend";
import { isResendConfigured } from "@/infrastructure/config/env";

export interface EmailDispatchResult {
  sent: boolean;
  mode: "resend" | "dry_run";
  messageId: string | null;
}

let cachedResend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!isResendConfigured()) {
    return null;
  }
  if (!cachedResend) {
    cachedResend = new Resend(process.env.RESEND_API_KEY!);
  }
  return cachedResend;
}

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  text: string;
  from?: string;
}): Promise<EmailDispatchResult> {
  const client = getResendClient();
  if (!client) {
    return {
      sent: false,
      mode: "dry_run",
      messageId: null,
    };
  }

  const fromAddress =
    params.from ?? process.env.RESEND_FROM_EMAIL?.trim() ?? "ClientPortal <onboarding@resend.dev>";

  const { data, error } = await client.emails.send({
    from: fromAddress,
    to: [params.to],
    subject: params.subject,
    text: params.text,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    sent: true,
    mode: "resend",
    messageId: data?.id ?? null,
  };
}
