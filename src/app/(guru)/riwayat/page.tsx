import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RiwayatClient } from "./RiwayatClient";
import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-[#800000] to-[#b30000] sm:rounded-b-3xl px-6 pt-10 pb-10 shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
        
        <header className="flex justify-between items-start relative z-10">
          <div className="text-white space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Riwayat Setoran</h1>
            <p className="text-white/80 font-medium">Kelas: {teacher.classes[0].name}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 transition-all rounded-full" title="Keluar">
              <LogOut className="w-5 h-5" />
            </Button>
          </form>
        </header>
      </div>
      
      <div className="px-4">
        <RiwayatClient logs={logs} students={students} />
      </div>
    </div>
  );
}
