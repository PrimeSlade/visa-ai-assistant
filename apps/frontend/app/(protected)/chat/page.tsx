"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatErrorDialog } from "@/components/chat/chat-error-dialog";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { StarterPromptList } from "@/components/chat/starter-prompt-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChatHistory } from "@/hooks/use-chat-history";
import { useChatReply } from "@/hooks/use-chat-reply";
import { authClient } from "@/lib/auth-client";

export default function ChatPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: session } = authClient.useSession();
  const { mutateAsync: sendChatReply, isPending: isSendingReply } =
    useChatReply();

  const { data: chatData, error, isLoading, isFetching } = useChatHistory();

  const displayName = session?.user?.name?.trim() || session?.user?.email;
  const errorMessage = error instanceof Error ? error.message : undefined;
  const messages = chatData?.chatHistory ?? [];

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const { error } = await authClient.signOut();

    if (error) {
      setIsSigningOut(false);
      return;
    }

    router.replace("/");
  };

  const handleComposerSubmit = async () => {
    const message = input.trim();
    if (!message) {
      return;
    }

    setInput("");

    try {
      await sendChatReply({ message });
    } catch (error) {
      setInput(message);
      setErrorDialogMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your message."
      );
      setIsErrorDialogOpen(true);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <ChatErrorDialog
        open={isErrorDialogOpen}
        message={errorDialogMessage}
        onOpenChange={setIsErrorDialogOpen}
      />
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-border/70 py-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome{displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Ask questions, review requirements, and get guided next steps.
            </p>
          </div>

          <Button
            type="button"
            className="hidden rounded-md bg-foreground text-background hover:bg-foreground/90 sm:inline-flex"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Logout
          </Button>
        </header>

        <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <StarterPromptList onSelect={setInput} />
          </aside>

          <Card className="flex min-h-[680px] flex-col border-border/70 bg-card/80">
            <ChatHeader />

            <CardContent className="flex flex-1 flex-col">
              <div className="space-y-4">
                <ChatMessageList
                  errorMessage={errorMessage}
                  isLoading={isLoading}
                  messages={messages}
                  isTyping={isSendingReply}
                />
              </div>

              <div className="mt-auto pt-10">
                <ChatComposer
                  input={input}
                  isFetching={isFetching || isSendingReply}
                  onChange={setInput}
                  onSubmit={() => {
                    void handleComposerSubmit();
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
