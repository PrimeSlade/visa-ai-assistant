"use client";

import { CalendarClock, Database, FileText, Sparkles } from "lucide-react";
import type { AdminPromptResponse } from "@/lib/prompt.api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PromptMetadataCardProps = {
  data: AdminPromptResponse;
  formattedLastUpdated: string;
};

export function PromptMetadataCard({
  data,
  formattedLastUpdated,
}: PromptMetadataCardProps) {
  return (
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
          <p className="text-sm font-medium">{formattedLastUpdated}</p>
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
  );
}
