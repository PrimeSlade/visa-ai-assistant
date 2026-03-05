"use client";

import { FilePenLine, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditConsultantPromptDialogProps = {
  open: boolean;
  draftPrompt: string;
  editorErrorMessage: string;
  isUpdatingPrompt: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftPromptChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function EditConsultantPromptDialog({
  open,
  draftPrompt,
  editorErrorMessage,
  isUpdatingPrompt,
  onOpenChange,
  onDraftPromptChange,
  onCancel,
  onSave,
}: EditConsultantPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Consultant Prompt</DialogTitle>
          <DialogDescription>
            Updates the live `dtv_dm_consultant` prompt immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="consultant-prompt-editor" className="text-sm font-medium">
            Prompt
          </label>
          <textarea
            id="consultant-prompt-editor"
            value={draftPrompt}
            onChange={(event) => onDraftPromptChange(event.target.value)}
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
            onClick={onCancel}
            disabled={isUpdatingPrompt}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={isUpdatingPrompt}>
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
  );
}
