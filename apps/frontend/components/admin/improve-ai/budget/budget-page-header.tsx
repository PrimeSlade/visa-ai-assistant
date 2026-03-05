"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type BudgetPageHeaderProps = {
  onDiscard: () => void;
};

export function BudgetPageHeader({ onDiscard }: BudgetPageHeaderProps) {
  return (
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
        <Button type="button" variant="outline" onClick={onDiscard}>
          Discard Draft
        </Button>
      </div>
    </header>
  );
}
