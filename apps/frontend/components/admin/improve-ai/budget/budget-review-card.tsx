"use client";

import { FileCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PromptDiffLine } from "@/lib/improve-ai-budget";
import type { ImproveAiBudgetResponse } from "@/lib/prompt.api";

type BudgetReviewCardProps = {
  result: ImproveAiBudgetResponse | null;
  diffSummary: {
    added: number;
    removed: number;
    unchanged: number;
  };
  diffLines: PromptDiffLine[];
};

export function BudgetReviewCard({
  result,
  diffSummary,
  diffLines,
}: BudgetReviewCardProps) {
  return (
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
                API usage: {result.apiUsage.predictionCalls} prediction,{" "}
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
                  <p className="text-xs text-muted-foreground">
                    Contact: {example.contactId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Similarity: {example.similarityScore} (
                    {example.similarEnough ? "pass" : "fail"})
                  </p>
                </div>
              ))}
            </div>

            {result.proposedPrompt ? (
              <div className="space-y-3">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Old Prompt
                    </p>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-6">
                      {result.oldPrompt}
                    </pre>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Proposed Prompt
                    </p>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-6">
                      {result.proposedPrompt}
                    </pre>
                  </div>
                </div>

                <div className="rounded-md border border-border/70 bg-background p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Diff Summary: +{diffSummary.added} / -{diffSummary.removed} / =
                    {diffSummary.unchanged}
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
  );
}
