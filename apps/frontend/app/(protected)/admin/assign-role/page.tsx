"use client";

import Link from "next/link";
import { LoaderCircle, Shield, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoleValue = "admin" | "user";
type AdminUser = {
  id: string;
  email?: string | null;
};

type Notice =
  | {
      tone: "success" | "error";
      message: string;
    }
  | null;

function getErrorMessage(error: { message?: string } | null | undefined): string {
  return error?.message ?? "Request could not be completed. Please try again.";
}

export default function AssignRoleAdminPage() {
  const { data: session } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [targetRole, setTargetRole] = useState<RoleValue>("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const handleUpdateByEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setNotice({
        tone: "error",
        message: "Please enter an email.",
      });
      return;
    }

    setNotice(null);
    setIsSubmitting(true);

    const { data, error } = await authClient.admin.listUsers({
      query: {
        limit: 1,
        offset: 0,
        filterField: "email",
        filterOperator: "eq",
        filterValue: normalizedEmail,
      },
    });

    if (error) {
      setNotice({
        tone: "error",
        message: getErrorMessage(error),
      });
      setIsSubmitting(false);
      return;
    }

    const user = ((data as { users?: AdminUser[] } | null)?.users ?? [])[0];

    if (!user?.id) {
      setNotice({
        tone: "error",
        message: "No user found with this email.",
      });
      setIsSubmitting(false);
      return;
    }

    const { error: setRoleError } = await authClient.admin.setRole({
      userId: user.id,
      role: targetRole,
    });

    if (setRoleError) {
      setNotice({
        tone: "error",
        message: getErrorMessage(setRoleError),
      });
      setIsSubmitting(false);
      return;
    }

    setEmail("");
    setNotice({
      tone: "success",
      message: `Role updated to "${targetRole}" successfully.`,
    });
    setIsSubmitting(false);
  };

  const sessionRole =
    (session?.user as { role?: string | null } | undefined)?.role ?? "unknown";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Assign User Roles</h1>
            <p className="text-sm text-muted-foreground">
              Privacy-focused role assignment by email.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              Session role: {sessionRole}
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href="/chat">Back to Chat</Link>
            </Button>
          </div>
        </div>

        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">Update By Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-email">User Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={targetRole === "admin" ? "default" : "outline"}
                onClick={() => setTargetRole("admin")}
              >
                <Shield className="size-4" />
                Admin
              </Button>
              <Button
                type="button"
                variant={targetRole === "user" ? "default" : "outline"}
                onClick={() => setTargetRole("user")}
              >
                <UserIcon className="size-4" />
                User
              </Button>
              <Button
                type="button"
                className="ml-auto"
                disabled={isSubmitting}
                onClick={() => {
                  void handleUpdateByEmail();
                }}
              >
                {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Apply Role
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              For privacy, this page does not reveal whether an email exists.
            </p>
          </CardContent>
        </Card>

        {notice ? (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.message}
          </div>
        ) : null}
      </div>
    </main>
  );
}
