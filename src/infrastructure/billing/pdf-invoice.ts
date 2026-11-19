import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatCurrencyCents } from "@/domain/money";
import { normalizeAccentHex } from "@/domain/theme";
import type { Invoice, Project, Studio } from "@/domain/types";

function parseHexToRgbTuple(hex: string): [number, number, number] {
  const clean = normalizeAccentHex(hex).replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function sanitizePdfText(value: string): string {
  // Standard PDF WinAnsi fonts only support basic Latin characters cleanly
  return value.replace(/[^\x20-\x7E]/g, " ");
}

export async function generateBrandedInvoicePdf(params: {
  studio: Studio;
  project: Project;
  invoice: Invoice;
}): Promise<Uint8Array> {
  const { studio, project, invoice } = params;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const [ar, ag, ab] = parseHexToRgbTuple(studio.accentHex);
  const accentColor = rgb(ar, ag, ab);
  const inkColor = rgb(0.09, 0.09, 0.08);
  const mutedColor = rgb(0.36, 0.35, 0.33);
  const surfaceColor = rgb(0.96, 0.95, 0.93);
  const borderColor = rgb(0.87, 0.85, 0.82);

  // Top studio accent bar
  page.drawRectangle({
    x: 0,
    y: height - 10,
    width,
    height: 10,
    color: accentColor,
  });

  const margin = 48;
  let y = height - 64;

  // Studio header
  page.drawText(sanitizePdfText(studio.studioName), {
    x: margin,
    y,
    size: 24,
    font: fontSerif,
    color: inkColor,
  });

  page.drawText("INVOICE", {
    x: width - margin - 92,
    y: y + 4,
    size: 18,
    font: fontBold,
    color: accentColor,
  });

  y -= 20;
  if (studio.tagline) {
    page.drawText(sanitizePdfText(studio.tagline), {
      x: margin,
      y,
      size: 10,
      font: fontRegular,
      color: mutedColor,
    });
  }

  page.drawText(sanitizePdfText(`# ${invoice.invoiceNumber}`), {
    x: width - margin - 110,
    y,
    size: 11,
    font: fontBold,
    color: inkColor,
  });

  y -= 16;
  page.drawText(sanitizePdfText(studio.contactEmail), {
    x: margin,
    y,
    size: 9.5,
    font: fontRegular,
    color: mutedColor,
  });

  if (studio.billingAddress) {
    y -= 13;
    page.drawText(sanitizePdfText(studio.billingAddress), {
      x: margin,
      y,
      size: 9,
      font: fontRegular,
      color: mutedColor,
    });
  }

  // Divider line
  y -= 24;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: borderColor,
  });

  // Bill To & Metadata card
  y -= 28;
  const metaTopY = y;
  page.drawText("BILLED TO", {
    x: margin,
    y,
    size: 8.5,
    font: fontBold,
    color: mutedColor,
  });
  page.drawText(sanitizePdfText(project.clientCompany), {
    x: margin,
    y: y - 16,
    size: 12,
    font: fontBold,
    color: inkColor,
  });
  page.drawText(sanitizePdfText(project.clientName), {
    x: margin,
    y: y - 31,
    size: 10,
    font: fontRegular,
    color: inkColor,
  });
  page.drawText(sanitizePdfText(project.clientEmail), {
    x: margin,
    y: y - 45,
    size: 9.5,
    font: fontRegular,
    color: mutedColor,
  });

  const rightColX = width - margin - 180;
  page.drawText("INVOICE DETAILS", {
    x: rightColX,
    y: metaTopY,
    size: 8.5,
    font: fontBold,
    color: mutedColor,
  });
  page.drawText(sanitizePdfText(`Status: ${invoice.status.toUpperCase()}`), {
    x: rightColX,
    y: metaTopY - 16,
    size: 10,
    font: fontBold,
    color: accentColor,
  });
  page.drawText(sanitizePdfText(`Issued: ${invoice.issueDate}`), {
    x: rightColX,
    y: metaTopY - 31,
    size: 9.5,
    font: fontRegular,
    color: inkColor,
  });
  page.drawText(sanitizePdfText(`Due Date: ${invoice.dueDate}`), {
    x: rightColX,
    y: metaTopY - 45,
    size: 9.5,
    font: fontRegular,
    color: inkColor,
  });

  // Project context bar
  y -= 80;
  page.drawRectangle({
    x: margin,
    y: y - 12,
    width: width - margin * 2,
    height: 36,
    color: surfaceColor,
    borderColor,
    borderWidth: 0.75,
  });
  page.drawText(sanitizePdfText(`Project: ${project.title}`), {
    x: margin + 14,
    y: y + 8,
    size: 10,
    font: fontBold,
    color: inkColor,
  });
  page.drawText(sanitizePdfText(invoice.title), {
    x: margin + 14,
    y: y - 5,
    size: 9,
    font: fontRegular,
    color: mutedColor,
  });

  // Line items table header
  y -= 48;
  page.drawRectangle({
    x: margin,
    y: y - 6,
    width: width - margin * 2,
    height: 24,
    color: accentColor,
  });
  const white = rgb(0.98, 0.98, 0.96);
  page.drawText("DESCRIPTION", {
    x: margin + 12,
    y: y + 2,
    size: 8.5,
    font: fontBold,
    color: white,
  });
  page.drawText("QTY", {
    x: width - margin - 185,
    y: y + 2,
    size: 8.5,
    font: fontBold,
    color: white,
  });
  page.drawText("RATE", {
    x: width - margin - 135,
    y: y + 2,
    size: 8.5,
    font: fontBold,
    color: white,
  });
  page.drawText("AMOUNT", {
    x: width - margin - 68,
    y: y + 2,
    size: 8.5,
    font: fontBold,
    color: white,
  });

  y -= 28;
  for (const item of invoice.lineItems) {
    const desc = sanitizePdfText(item.description).slice(0, 62);
    page.drawText(desc, {
      x: margin + 12,
      y,
      size: 10,
      font: fontRegular,
      color: inkColor,
    });
    page.drawText(String(item.quantity), {
      x: width - margin - 182,
      y,
      size: 10,
      font: fontRegular,
      color: inkColor,
    });
    page.drawText(
      sanitizePdfText(formatCurrencyCents(item.unitAmountCents, invoice.currency)),
      {
        x: width - margin - 135,
        y,
        size: 10,
        font: fontRegular,
        color: mutedColor,
      }
    );
    page.drawText(
      sanitizePdfText(formatCurrencyCents(item.amountCents, invoice.currency)),
      {
        x: width - margin - 72,
        y,
        size: 10,
        font: fontBold,
        color: inkColor,
      }
    );
    y -= 14;
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 0.5,
      color: borderColor,
    });
    y -= 18;
  }

  // Totals block
  y -= 8;
  const totalsLabelX = width - margin - 170;
  const totalsValueX = width - margin - 72;

  page.drawText("Subtotal", {
    x: totalsLabelX,
    y,
    size: 10,
    font: fontRegular,
    color: mutedColor,
  });
  page.drawText(
    sanitizePdfText(formatCurrencyCents(invoice.subtotalCents, invoice.currency)),
    {
      x: totalsValueX,
      y,
      size: 10,
      font: fontRegular,
      color: inkColor,
    }
  );

  y -= 18;
  const taxPctLabel = (invoice.taxBps / 100).toFixed(invoice.taxBps % 100 === 0 ? 0 : 2);
  page.drawText(`Tax (${taxPctLabel}%)`, {
    x: totalsLabelX,
    y,
    size: 10,
    font: fontRegular,
    color: mutedColor,
  });
  page.drawText(
    sanitizePdfText(formatCurrencyCents(invoice.taxCents, invoice.currency)),
    {
      x: totalsValueX,
      y,
      size: 10,
      font: fontRegular,
      color: inkColor,
    }
  );

  y -= 24;
  page.drawLine({
    start: { x: totalsLabelX - 8, y: y + 14 },
    end: { x: width - margin, y: y + 14 },
    thickness: 1,
    color: inkColor,
  });
  page.drawText("Total Due", {
    x: totalsLabelX,
    y,
    size: 12,
    font: fontBold,
    color: inkColor,
  });
  page.drawText(
    sanitizePdfText(formatCurrencyCents(invoice.totalCents, invoice.currency)),
    {
      x: totalsValueX - 6,
      y,
      size: 12,
      font: fontBold,
      color: accentColor,
    }
  );

  // Payment status note or invoice notes
  y -= 48;
  if (invoice.notes) {
    page.drawText("NOTES", {
      x: margin,
      y,
      size: 8.5,
      font: fontBold,
      color: mutedColor,
    });
    page.drawText(sanitizePdfText(invoice.notes).slice(0, 95), {
      x: margin,
      y: y - 15,
      size: 9.5,
      font: fontRegular,
      color: mutedColor,
    });
  }

  if (invoice.status === "paid" && invoice.paidAt) {
    page.drawText(
      sanitizePdfText(
        `Settled on ${invoice.paidAt.slice(0, 10)}${invoice.paymentMethodNote ? ` - ${invoice.paymentMethodNote}` : ""}`
      ),
      {
        x: margin,
        y: 72,
        size: 9.5,
        font: fontBold,
        color: accentColor,
      }
    );
  }

  // Footer
  page.drawLine({
    start: { x: margin, y: 54 },
    end: { x: width - margin, y: 54 },
    thickness: 0.5,
    color: borderColor,
  });
  page.drawText(
    sanitizePdfText(
      `Issued by ${studio.studioName} (${studio.contactEmail}) - Generated via ClientPortal`
    ),
    {
      x: margin,
      y: 38,
      size: 8.5,
      font: fontRegular,
      color: mutedColor,
    }
  );

  return pdfDoc.save();
}
