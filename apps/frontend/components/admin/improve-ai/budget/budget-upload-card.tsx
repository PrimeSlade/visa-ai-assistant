"use client";

import { type ChangeEvent } from "react";
import { FileJson, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BudgetUploadCardProps = {
  fileName: string;
  currentLiveVersion?: number;
  runError: string;
  isRunningBudgetImprove: boolean;
  isApproving: boolean;
  canRun: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRun: () => void;
};

export function BudgetUploadCard({
  fileName,
  currentLiveVersion,
  runError,
  isRunningBudgetImprove,
  isApproving,
  canRun,
  onFileChange,
  onRun,
}: BudgetUploadCardProps) {
  return (
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
            void onFileChange(event);
          }}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground"
        />
        <p className="text-xs text-muted-foreground">
          {fileName ? `Loaded file: ${fileName}` : "No file selected."}
        </p>
        {typeof currentLiveVersion === "number" ? (
          <p className="text-xs text-muted-foreground">
            Current live version: v{currentLiveVersion}
          </p>
        ) : null}
        <Button
          type="button"
          className="w-full"
          onClick={onRun}
          disabled={!canRun || isRunningBudgetImprove || isApproving}
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
  );
}
