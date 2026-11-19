import { AuthModule } from "@/components/auth/AuthModule";

export const metadata = {
  title: "Sign In — FreelanceOS ClientPortal",
  description: "Sign in to manage client workspaces, deliverable sign-offs, and invoices.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] dark:bg-[#070A0F] transition-colors duration-200">
      <AuthModule initialMode="login" />
    </main>
  );
}
