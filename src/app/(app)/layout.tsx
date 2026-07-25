import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Providers } from "@/components/providers";
import { AppSidebar } from "@/components/app/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  return (
    <Providers>
      <div className="flex min-h-screen">
        <AppSidebar email={session.user.email ?? ""} name={session.user.name ?? null} />
        <main className="flex-1 md:pl-64">
          <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
        </main>
      </div>
    </Providers>
  );
}
