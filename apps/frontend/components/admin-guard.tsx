"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { authClient } from "../lib/auth-client";

type AdminGuardProps = {
  children: ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as { role?: string | null } | undefined)?.role;
  const isAdmin = role === "admin";

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!session?.user) {
      router.replace("/");
      return;
    }

    if (!isAdmin) {
      router.replace("/chat");
    }
  }, [isAdmin, isPending, router, session?.user]);

  if (isPending || !session?.user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Checking your session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
