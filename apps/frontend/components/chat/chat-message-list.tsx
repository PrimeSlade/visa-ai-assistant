import { LoaderCircle } from "lucide-react";
import type { ChatHistoryMessage } from "@/lib/chat.api";

const defaultConsultantMessage =
  "Hello. I can help you understand the Thailand DTV process, required documents, eligibility questions, and application preparation. What would you like to start with?";

type ChatMessageListProps = {
  errorMessage?: string;
  isLoading: boolean;
  messages: ChatHistoryMessage[];
};

export function ChatMessageList({
  errorMessage,
  isLoading,
  messages,
}: ChatMessageListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
        <LoaderCircle className="mr-2 size-4 animate-spin" />
        Loading chat history...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {errorMessage}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-start">
        <div className="w-fit max-w-[85%] rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm leading-6 whitespace-pre-wrap break-words text-foreground sm:max-w-xl">
          {defaultConsultantMessage}
        </div>
      </div>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "consultant" ? "justify-start" : "justify-end"
          }`}
        >
          <div
            className={`w-fit max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap break-words sm:max-w-xl ${
              message.role === "consultant"
                ? "border border-border/70 bg-background text-foreground"
                : "bg-foreground text-background"
            }`}
          >
            {message.message}
          </div>
        </div>
      ))}
    </>
  );
}
