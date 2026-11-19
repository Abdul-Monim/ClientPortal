import type { Metadata } from "next";
import { Cormorant_Garamond, Lexend } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClientPortal — White-Label Client Hub for Freelancers",
  description:
    "Give every client a calm, password-protected branded hub for milestone progress, deliverable approvals, and invoices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${lexend.variable}`}
      suppressHydrationWarning
    >
      <body className="font-ui antialiased selection:bg-[var(--brand-accent-soft)]">
        {children}
      </body>
    </html>
  );
}
