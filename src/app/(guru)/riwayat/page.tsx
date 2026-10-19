import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RiwayatClient } from "./RiwayatClient";


export default async function RiwayatPage() {
  const sessionId = await getSession();
  if (!sessionId) redirect("/login");

  const teacher = await prisma.user.findUnique({
    where: { id: sessionId },
    include: {
      classes: {
        include: {
          students: {
            where: { isActive: true },
            orderBy: { name: "asc" }
          }
        }
      }
    }
  });

  if (!teacher || teacher.classes.length === 0) {
    return (
      <div className="p-4 pt-10 text-center">
        <p className="text-slate-500">Anda tidak memiliki kelas yang aktif.</p>
      </div>
    );
  }

  const students = teacher.classes[0].students;
  const studentIds = students.map(s => s.id);

  const logs = await prisma.depositLog.findMany({
    where: {
      studentId: { in: studentIds }
    },
    orderBy: { timestamp: "desc" },
    include: {
      student: {
        select: { id: true, name: true }
      }
    }
  });

  return (
    <div className="space-y-6 pb-24">
      <PageHeader title="Riwayat Setoran" subtitle={teacher.classes[0].name} />
      
      <div className="px-4">
        <RiwayatClient logs={logs} students={students} />
      </div>
    </div>
  );
}
