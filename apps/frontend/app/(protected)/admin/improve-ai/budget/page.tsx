"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { BudgetApproveCard } from "@/components/admin/improve-ai/budget/budget-approve-card";
import { BudgetPageHeader } from "@/components/admin/improve-ai/budget/budget-page-header";
import { BudgetReviewCard } from "@/components/admin/improve-ai/budget/budget-review-card";
import { BudgetUploadCard } from "@/components/admin/improve-ai/budget/budget-upload-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAdminPrompt,
  useImproveAiBudget,
  useUpdateConsultantPrompt,
} from "@/hooks/use-admin-prompt";
import {
  BUDGET_DRAFT_STORAGE_KEY,
  buildPromptDiff,
  clearBudgetDraftStorage,
  safeParseConversations,
  type PromptDiffLine,
} from "@/lib/improve-ai-budget";
import type {
  BudgetConversationRecord,
  ImproveAiBudgetResponse,
} from "@/lib/prompt.api";
import { useRouter } from "next/navigation";

export default function ImproveAiBudgetPage() {
  const router = useRouter();
  const { data: adminPrompt } = useAdminPrompt();
  const { mutateAsync: runBudgetImprove, isPending: isRunningBudgetImprove } =
    useImproveAiBudget();
  const { mutateAsync: updatePrompt, isPending: isApproving } =
    useUpdateConsultantPrompt();

  const [fileName, setFileName] = useState("");
  const [dataset, setDataset] = useState<BudgetConversationRecord[] | null>(
    null
  );
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
      setRunError(
        error instanceof Error ? error.message : "Invalid JSON file."
      );
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
        error instanceof Error
          ? error.message
          : "Failed to run budget improve.";
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
      toast.success(
        `Prompt updated successfully to version v${updated.version}.`
      );
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
        <BudgetPageHeader onDiscard={handleDiscard} />

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
          <BudgetUploadCard
            fileName={fileName}
            currentLiveVersion={adminPrompt?.version}
            runError={runError}
            isRunningBudgetImprove={isRunningBudgetImprove}
            isApproving={isApproving}
            canRun={!!dataset}
            onFileChange={handleFileChange}
            onRun={() => {
              void handleRun();
            }}
          />

          <BudgetReviewCard
            result={result}
            diffSummary={diffSummary}
            diffLines={diffLines}
          />
        </div>

        <BudgetApproveCard
          hasProposedPrompt={!!result?.proposedPrompt}
          hasResult={!!result}
          isRunningBudgetImprove={isRunningBudgetImprove}
          isApproving={isApproving}
          onApprove={() => {
            void handleApprove();
          }}
          onCancel={handleCancel}
        />
      </div>
    </main>
  );
}
