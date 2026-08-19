import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UsersClient } from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function KepsekUsersPage() {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionId },
    select: { role: true, mustChangePassword: true },
  });

  if (!user || (user.role !== "KEPALA_SEKOLAH" && user.role !== "STAFF_TU")) {
    redirect("/");
  }

  if (user.mustChangePassword) redirect("/ganti-password");

  // Fetch all users (excluding passwords of course)
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      classes: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return <UsersClient users={allUsers} />;
}
