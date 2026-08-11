import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { hashSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MANAGER_ONLY_ROUTES = [
  "/dashboard",
  "/dashboard/tracking",
  "/dashboard/dvir",
  "/dashboard/drivers",
  "/dashboard/maintenance",
  "/dashboard/assets",
  "/dashboard/fuel",
  "/dashboard/settings",
];

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
        select: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      })
    : null;

  if (!session) {
    redirect("/signin");
  }

  let userRole = session.user.role;

  // Auto-correct: if this User has MANAGER role but exists in the Driver table,
  // their account was created before role tracking — fix it now.
  if (userRole === "MANAGER") {
    const driverRecord = await prisma.driver.findFirst({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (driverRecord) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "DRIVER" },
      });
      userRole = "DRIVER";
    }
  }

  // Server-side route guard for drivers
  // The proxy sets x-pathname so we can read the actual requested path here.
  if (userRole === "DRIVER") {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    const isManagerRoute = MANAGER_ONLY_ROUTES.some((route) => {
      if (route === "/dashboard") {
        return pathname === "/dashboard";
      }
      return pathname === route || pathname.startsWith(route + "/");
    });

    if (isManagerRoute) {
      redirect("/dashboard/driver-portal");
    }
  }

  return (
    <DashboardShell userName={session.user.name} userRole={userRole}>
      {children}
    </DashboardShell>
  );
}