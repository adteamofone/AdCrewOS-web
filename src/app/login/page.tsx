import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Log in — AdCrewOS" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[420px] w-[720px] rounded-full bg-primary/15 blur-[130px]" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <Link href="/" className="mb-8 self-center"><Logo /></Link>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-muted">
          Forgot your password? Email{" "}
          <a href="mailto:support@adcrewos.com" className="underline hover:text-text">
            support@adcrewos.com
          </a>{" "}
          and we&apos;ll get you back in.
        </p>
      </div>
    </div>
  );
}
