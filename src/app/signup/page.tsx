import { AuthModule } from "@/components/auth/AuthModule";

export const metadata = {
  title: "Create Studio Hub — FreelanceOS ClientPortal",
  description: "Set up your white-label freelance identity and start sharing deliverables with clients.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] dark:bg-[#070A0F] transition-colors duration-200">
      <AuthModule initialMode="signup" />
    </main>
  );
}
