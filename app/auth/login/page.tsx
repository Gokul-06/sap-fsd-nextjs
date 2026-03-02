import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign In | Westernacher SAP FSD Generator",
  description: "Sign in to the SAP FSD Generator",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

/** Loading fallback for login page (shows while useSearchParams resolves) */
function LoginFallback() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#1B2A4A] via-[#1E3258] to-[#2A3F6E]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  );
}
