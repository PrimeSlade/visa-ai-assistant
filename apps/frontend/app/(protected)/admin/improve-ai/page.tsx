import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImproveAiAdminPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="text-xl tracking-tight">
              Improve AI (Admin)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This page is reserved for admin prompt-improvement actions. You can
              wire this screen to `/improve-ai` and `/improve-ai-manually` when
              ready.
            </p>
            <Button asChild variant="outline">
              <Link href="/chat">Back to Chat</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
