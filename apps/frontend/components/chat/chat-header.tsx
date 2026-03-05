import { useState } from "react";
import { LoaderCircle, Trash2, Bot } from "lucide-react";
import { Button } from "../ui/button";
import { CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader as AlertDialogLayoutHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

type ChatHeaderProps = {
  onDeleteConversation: () => Promise<void>;
  isDeletingConversation?: boolean;
};

export function ChatHeader({
  onDeleteConversation,
  isDeletingConversation = false,
}: ChatHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <CardHeader className="border-b border-border/70">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-background">
            <Bot className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Thailand DTV Assistant</CardTitle>
            <CardDescription>
              Tell me about your situation and I will guide you from there.
            </CardDescription>
          </div>
        </div>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeletingConversation}
            >
              {isDeletingConversation ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete Chat
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogLayoutHeader>
              <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                whole conversation and all messages.
              </AlertDialogDescription>
            </AlertDialogLayoutHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingConversation}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                disabled={isDeletingConversation}
                onClick={(event) => {
                  event.preventDefault();
                  void (async () => {
                    await onDeleteConversation();
                    setIsDialogOpen(false);
                  })();
                }}
              >
                {isDeletingConversation ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : null}
                Yes, delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardHeader>
  );
}
