import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GantiPasswordClient } from "./GantiPasswordClient";

export default async function GantiPasswordPage() {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { id: true, name: true, username: true, role: true, mustChangePassword: true },
  });

  if (!user) redirect("/login");

  // If they don't need to change password, send them home
  if (!user.mustChangePassword) {
    redirect("/");
  }

  // Guru → after password change, must go to /siswa to fill initial student data
  // Kepsek & Staff TU → after password change, go home
  const redirectAfter = user.role === "GURU" ? "/siswa" : "/";

  return (
    <GantiPasswordClient
      userId={user.id}
      userName={user.name}
      username={user.username}
      redirectAfter={redirectAfter}
    />
  );
}
