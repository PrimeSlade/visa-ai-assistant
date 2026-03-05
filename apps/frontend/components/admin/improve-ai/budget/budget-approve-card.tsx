"use client";

import { FileCheck, FileWarning, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BudgetApproveCardProps = {
  hasProposedPrompt: boolean;
  hasResult: boolean;
  isRunningBudgetImprove: boolean;
  isApproving: boolean;
  onApprove: () => void;
  onCancel: () => void;
};

export function BudgetApproveCard({
  hasProposedPrompt,
  hasResult,
  isRunningBudgetImprove,
  isApproving,
  onApprove,
  onCancel,
}: BudgetApproveCardProps) {
  return (
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
          onClick={onApprove}
          disabled={!hasProposedPrompt || isRunningBudgetImprove || isApproving}
        >
          {isApproving ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <FileCheck className="size-4" />
          )}
          Approve and Save Prompt
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {!hasProposedPrompt && hasResult ? (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <FileWarning className="size-4" />
            Approve is disabled because no draft prompt was generated.
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
