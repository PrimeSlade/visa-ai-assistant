"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { EditConsultantPromptDialog } from "@/components/admin/improve-ai/edit-consultant-prompt-dialog";
import { ImproveAiHeader } from "@/components/admin/improve-ai/improve-ai-header";
import { PromptMetadataCard } from "@/components/admin/improve-ai/prompt-metadata-card";
import { MarkdownMessage } from "@/components/chat/markdown-message";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      toast.success(
        `Prompt updated successfully to version v${updated.version}.`
      );
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
        <ImproveAiHeader
          isFetching={isFetching}
          canEditPrompt={!isLoading && !error && !!data}
          onRefresh={() => {
            void refetch();
          }}
          onOpenPromptEditor={openPromptEditor}
        />

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
            <PromptMetadataCard
              data={data}
              formattedLastUpdated={formatLastUpdated(data.lastUpdated)}
            />

            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle className="text-lg">
                  Live Prompt (Markdown)
                </CardTitle>
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

      <EditConsultantPromptDialog
        open={isEditorOpen}
        draftPrompt={draftPrompt}
        editorErrorMessage={editorErrorMessage}
        isUpdatingPrompt={isUpdatingPrompt}
        onOpenChange={setIsEditorOpen}
        onDraftPromptChange={setDraftPrompt}
        onCancel={() => setIsEditorOpen(false)}
        onSave={() => {
          void handleSavePrompt();
        }}
      />
    </main>
  );
}
