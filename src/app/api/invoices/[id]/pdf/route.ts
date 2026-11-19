import { NextResponse, type NextRequest } from "next/server";
import { generateBrandedInvoicePdf } from "@/infrastructure/billing/pdf-invoice";
import { getPortalRepository } from "@/infrastructure/repositories";
import {
  getAuthenticatedFreelancer,
  getVerifiedClientPortalSession,
} from "@/services/auth";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await context.params;
    const repo = getPortalRepository();
    const data = await repo.getInvoiceWithContext(invoiceId);
    if (!data) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    const [clientSession, freelancer] = await Promise.all([
      getVerifiedClientPortalSession(data.project.id, data.project.passcodeVersion),
      getAuthenticatedFreelancer(),
    ]);

    if (!clientSession && !freelancer) {
      return NextResponse.json(
        { error: "Please sign in to download this invoice." },
        { status: 401 }
      );
    }

    const pdfBytes = await generateBrandedInvoicePdf(data);
    const filename = `${data.invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate invoice PDF right now." },
      { status: 500 }
    );
  }
}
