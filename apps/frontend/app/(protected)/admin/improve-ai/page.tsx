"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Database,
  FilePenLine,
  FileText,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MarkdownMessage } from "@/components/chat/markdown-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAdminPrompt,
  useUpdateConsultantPrompt,
} from "@/hooks/use-admin-prompt";

function formatLastUpdated(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ImproveAiAdminPage() {
  const { data, error, isLoading, isFetching, refetch } = useAdminPrompt();
  const { mutateAsync: updatePrompt, isPending: isUpdatingPrompt } =
    useUpdateConsultantPrompt();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [editorErrorMessage, setEditorErrorMessage] = useState("");

  const openPromptEditor = () => {
    if (!data) {
      return;
    }

    setDraftPrompt(data.prompt);
    setEditorErrorMessage("");
    setIsEditorOpen(true);
  };

  const handleSavePrompt = async () => {
    const normalizedPrompt = draftPrompt.trim();
    if (!normalizedPrompt) {
      setEditorErrorMessage("Prompt cannot be empty.");
      return;
    }

    setEditorErrorMessage("");

    try {
      const updated = await updatePrompt({ prompt: normalizedPrompt });
      setIsEditorOpen(false);
      setDraftPrompt("");
      await refetch();
      toast.success(`Prompt updated successfully to version v${updated.version}.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update consultant prompt."
      );
      setEditorErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update consultant prompt."
      );
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <ShieldCheck className="size-5" />
              Improve AI (Admin)
            </h1>
            <p className="text-sm text-muted-foreground">
              Live consultant prompt details for verification before edits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void refetch();
              }}
              disabled={isFetching}
            >
              {isFetching ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Refresh
            </Button>
            <Button asChild variant="outline">
              <Link href="/chat">Back to Chat</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/improve-ai/budget">
                <Sparkles className="size-4" />
                Improve AI (JSON)
              </Link>
            </Button>
            <Button
              type="button"
              onClick={openPromptEditor}
              disabled={isLoading || !!error || !data}
            >
              <FilePenLine className="size-4" />
              Edit Prompt
            </Button>
          </div>
        </header>

        {isLoading ? (
          <Card className="border-border/70 bg-card/80">
            <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Loading live prompt...
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base text-destructive">
                Failed to load prompt
              </CardTitle>
              <CardDescription className="text-destructive/90">
                {error instanceof Error
                  ? error.message
                  : "Could not load admin prompt data."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {!isLoading && !error && data ? (
          <div className="space-y-4">
            <Card className="border-border/70 bg-card/80">
              <CardHeader className="gap-3">
                <CardTitle className="text-lg">Prompt Metadata</CardTitle>
                <CardDescription>
                  This endpoint is locked to the live consultant prompt.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="size-3.5" />
                    Prompt Name
                  </p>
                  <p className="text-sm font-medium">{data.name}</p>
                </div>

                <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5" />
                    Version
                  </p>
                  <p className="text-sm font-medium">v{data.version}</p>
                </div>

                <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    Last Updated
                  </p>
                  <p className="text-sm font-medium">
                    {formatLastUpdated(data.lastUpdated)}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Database className="size-3.5" />
                    Source
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {data.source}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle className="text-lg">Live Prompt (Markdown)</CardTitle>
                <CardDescription>
                  Rendered with the same markdown component used in chat.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border/70 bg-background p-4 text-sm leading-6 break-words">
                  <MarkdownMessage content={data.prompt} />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="w-[95vw] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Consultant Prompt</DialogTitle>
            <DialogDescription>
              Updates the live `dtv_dm_consultant` prompt immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label
              htmlFor="consultant-prompt-editor"
              className="text-sm font-medium"
            >
              Prompt
            </label>
            <textarea
              id="consultant-prompt-editor"
              value={draftPrompt}
              onChange={(event) => setDraftPrompt(event.target.value)}
              className="min-h-[420px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            {editorErrorMessage ? (
              <p className="text-sm text-destructive">{editorErrorMessage}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditorOpen(false)}
              disabled={isUpdatingPrompt}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                void handleSavePrompt();
              }}
              disabled={isUpdatingPrompt}
            >
              {isUpdatingPrompt ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <FilePenLine className="size-4" />
              )}
              Save Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
