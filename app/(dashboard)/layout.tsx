import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { hashSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token
    ? await prisma.session.findFirst({
        where: {
          tokenHash: hashSessionToken(token),
          expiresAt: { gt: new Date() },
        },
        select: { user: { select: { name: true } } },
      })
    : null;

  if (!session) {
    redirect("/signin");
  }

  return <DashboardShell userName={session.user.name}>{children}</DashboardShell>;
}