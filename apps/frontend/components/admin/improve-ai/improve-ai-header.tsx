"use client";

import Link from "next/link";
import {
  FilePenLine,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ImproveAiHeaderProps = {
  isFetching: boolean;
  canEditPrompt: boolean;
  onRefresh: () => void;
  onOpenPromptEditor: () => void;
};

export function ImproveAiHeader({
  isFetching,
  canEditPrompt,
  onRefresh,
  onOpenPromptEditor,
}: ImproveAiHeaderProps) {
  return (
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
        <Button type="button" variant="outline" onClick={onRefresh} disabled={isFetching}>
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
        <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/admin/improve-ai/budget">
            <Sparkles className="size-4" />
            Improve AI (JSON)
          </Link>
        </Button>
        <Button type="button" onClick={onOpenPromptEditor} disabled={!canEditPrompt}>
          <FilePenLine className="size-4" />
          Edit Prompt
        </Button>
      </div>
    </header>
  );
}
