import { BottomNav } from "@/components/layout/BottomNav";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, mustChangePassword: true },
  });

  if (!user) redirect("/login");

  // Force password change before anything else
  if (user.mustChangePassword) redirect("/ganti-password");

  return (
    <div className="min-h-screen bg-slate-100 pb-20 print:pb-0 print:bg-white">
      <main className="max-w-3xl mx-auto bg-white min-h-screen print:min-h-0 shadow-sm relative">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

