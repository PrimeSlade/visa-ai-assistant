import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssignRoleAdminPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="text-xl tracking-tight">
              Assign Admin Role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This page is ready for role assignment UI. You can connect it to
              your admin role-management API when you want to enable it.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/chat">Back to Chat</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/improve-ai">Go to Improve AI</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
