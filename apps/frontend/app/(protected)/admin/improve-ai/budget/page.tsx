"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCheck,
  FileJson,
  FileWarning,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useAdminPrompt,
  useImproveAiBudget,
  useUpdateConsultantPrompt,
} from "@/hooks/use-admin-prompt";
import type {
  BudgetConversationRecord,
  ImproveAiBudgetResponse,
} from "@/lib/prompt.api";

const BUDGET_DRAFT_STORAGE_KEY = "improve-ai-budget-draft-v1";

type PromptDiffLine = {
  type: "same" | "add" | "remove";
  value: string;
};

function clearBudgetDraftStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(BUDGET_DRAFT_STORAGE_KEY);
}

function safeParseConversations(jsonText: string): BudgetConversationRecord[] {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON must be an array of conversation records.");
  }

  return parsed as BudgetConversationRecord[];
}

function buildPromptDiff(oldPrompt: string, proposedPrompt: string): PromptDiffLine[] {
  const oldLines = oldPrompt.split("\n");
  const newLines = proposedPrompt.split("\n");
  const maxLength = Math.max(oldLines.length, newLines.length);
  const result: PromptDiffLine[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    const oldLine = oldLines[index];
    const newLine = newLines[index];

    if (oldLine === newLine && oldLine !== undefined) {
      result.push({ type: "same", value: oldLine });
      continue;
    }

    if (oldLine !== undefined) {
      result.push({ type: "remove", value: oldLine });
    }

    if (newLine !== undefined) {
      result.push({ type: "add", value: newLine });
    }
  }

  return result;
}

export default function ImproveAiBudgetPage() {
  const router = useRouter();
  const { data: adminPrompt } = useAdminPrompt();
  const { mutateAsync: runBudgetImprove, isPending: isRunningBudgetImprove } =
    useImproveAiBudget();
  const { mutateAsync: updatePrompt, isPending: isApproving } =
    useUpdateConsultantPrompt();

  const [fileName, setFileName] = useState("");
  const [dataset, setDataset] = useState<BudgetConversationRecord[] | null>(null);
  const [runError, setRunError] = useState("");
  const [result, setResult] = useState<ImproveAiBudgetResponse | null>(null);

  const diffLines = useMemo(() => {
    if (!result?.oldPrompt || !result.proposedPrompt) {
      return [] as PromptDiffLine[];
    }

    return buildPromptDiff(result.oldPrompt, result.proposedPrompt);
  }, [result]);

  const diffSummary = useMemo(() => {
    return diffLines.reduce(
      (acc, line) => {
        if (line.type === "add") {
          acc.added += 1;
        } else if (line.type === "remove") {
          acc.removed += 1;
        } else {
          acc.unchanged += 1;
        }

        return acc;
      },
      { added: 0, removed: 0, unchanged: 0 }
    );
  }, [diffLines]);

  const resetRunState = () => {
    setFileName("");
    setDataset(null);
    setRunError("");
    setResult(null);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setRunError("");
    setResult(null);

    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      setDataset(null);
      return;
    }

    try {
      const text = await file.text();
      const parsed = safeParseConversations(text);
      setFileName(file.name);
      setDataset(parsed);
    } catch (error) {
      setFileName("");
      setDataset(null);
      setRunError(error instanceof Error ? error.message : "Invalid JSON file.");
    }
  };

  const handleRun = async () => {
    if (!dataset) {
      setRunError("Please upload conversations JSON before running analysis.");
      return;
    }

    setRunError("");

    try {
      const runResult = await runBudgetImprove({ conversations: dataset });
      setResult(runResult);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          BUDGET_DRAFT_STORAGE_KEY,
          JSON.stringify({
            fileName,
            dataset,
            result: runResult,
          })
        );
      }

      toast.success("Budget improve analysis completed.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to run budget improve.";
      setRunError(message);
      toast.error(message);
    }
  };

  const handleApprove = async () => {
    if (!result?.proposedPrompt) {
      return;
    }

    try {
      const updated = await updatePrompt({ prompt: result.proposedPrompt });
      clearBudgetDraftStorage();
      resetRunState();
      toast.success(`Prompt updated successfully to version v${updated.version}.`);
      router.push("/admin/improve-ai");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update consultant prompt.";
      setRunError(message);
      toast.error(message);
    }
  };

  const handleDiscard = () => {
    clearBudgetDraftStorage();
    resetRunState();
    toast.success("Draft discarded.");
  };

  const handleCancel = () => {
    clearBudgetDraftStorage();
    resetRunState();
    router.push("/admin/improve-ai");
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Improve AI with Dataset</h1>
            <p className="text-sm text-muted-foreground">
              Upload conversations JSON, run 3-sample budget analysis, review diff, then approve.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/improve-ai">Back to Admin Prompt</Link>
            </Button>
            <Button type="button" variant="outline" onClick={handleDiscard}>
              Discard Draft
            </Button>
          </div>
        </header>

        {(isRunningBudgetImprove || isApproving) && (
          <Card className="border-border/70 bg-card/80">
            <CardContent className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              {isRunningBudgetImprove
                ? "Analyzing 3 samples and generating prompt draft..."
                : "Saving approved prompt to database..."}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-12">
          <Card className="border-border/70 bg-card/80 lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-base">1) Upload Dataset</CardTitle>
              <CardDescription>Provide a `conversations.json` array.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  void handleFileChange(event);
                }}
                className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground"
              />
              <p className="text-xs text-muted-foreground">
                {fileName ? `Loaded file: ${fileName}` : "No file selected."}
              </p>
              {adminPrompt ? (
                <p className="text-xs text-muted-foreground">
                  Current live version: v{adminPrompt.version}
                </p>
              ) : null}
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  void handleRun();
                }}
                disabled={!dataset || isRunningBudgetImprove || isApproving}
              >
                {isRunningBudgetImprove ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <FileJson className="size-4" />
                )}
                Run Budget Analysis
              </Button>
              {runError ? <p className="text-sm text-destructive">{runError}</p> : null}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 lg:col-span-8">
            <CardHeader>
              <CardTitle className="text-base">2) Review Result</CardTitle>
              <CardDescription>
                Approve only if the draft improves failed examples.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <p className="text-sm text-muted-foreground">
                  Run analysis to generate draft and diff preview.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border border-border/70 bg-background/70 p-3 text-sm">
                    <p className="font-medium">Result</p>
                    <p className="text-muted-foreground">{result.reason}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      API usage: {result.apiUsage.predictionCalls} prediction, {" "}
                      {result.apiUsage.editorCalls} editor, {result.apiUsage.total} total
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {result.selectedExamples.map((example, index) => (
                      <div
                        key={`${example.contactId}-${example.category}-${index}`}
                        className="rounded-md border border-border/70 bg-background/70 p-3 text-sm"
                      >
                        <p className="font-medium capitalize">{example.category}</p>
                        <p className="text-xs text-muted-foreground">Contact: {example.contactId}</p>
                        <p className="text-xs text-muted-foreground">
                          Similarity: {example.similarityScore} ({example.similarEnough ? "pass" : "fail"})
                        </p>
                      </div>
                    ))}
                  </div>

                  {result.proposedPrompt ? (
                    <div className="space-y-3">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-md border border-border/70 bg-background p-3">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">Old Prompt</p>
                          <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-6">
                            {result.oldPrompt}
                          </pre>
                        </div>
                        <div className="rounded-md border border-border/70 bg-background p-3">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">Proposed Prompt</p>
                          <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-6">
                            {result.proposedPrompt}
                          </pre>
                        </div>
                      </div>

                      <div className="rounded-md border border-border/70 bg-background p-3">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          Diff Summary: +{diffSummary.added} / -{diffSummary.removed} / ={diffSummary.unchanged}
                        </p>
                        <div className="max-h-64 overflow-auto font-mono text-xs leading-6">
                          {diffLines.map((line, index) => (
                            <div
                              key={`${line.type}-${index}`}
                              className={
                                line.type === "add"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                  : line.type === "remove"
                                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                    : "text-muted-foreground"
                              }
                            >
                              {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
                              {line.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-200">
                      <FileCheck className="size-4" />
                      No prompt update is needed for this run.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">3) Approve</CardTitle>
            <CardDescription>
              Save proposed prompt to database only after review.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => {
                void handleApprove();
              }}
              disabled={!result?.proposedPrompt || isRunningBudgetImprove || isApproving}
            >
              {isApproving ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <FileCheck className="size-4" />
              )}
              Approve and Save Prompt
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {!result?.proposedPrompt && result ? (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <FileWarning className="size-4" />
                Approve is disabled because no draft prompt was generated.
              </span>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
