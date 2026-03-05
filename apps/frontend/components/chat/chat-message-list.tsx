import { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import type { ChatHistoryMessage } from "@/lib/chat.api";
import { MarkdownMessage } from "./markdown-message";
import { TypingIndicator } from "./typing-indicator";

const defaultConsultantMessage =
  "Hello. I can help you understand the Thailand DTV process, required documents, eligibility questions, and application preparation. What would you like to start with?";

function formatMessageDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function shouldShowTimestamp(
  messages: ChatHistoryMessage[],
  index: number
): boolean {
  const current = messages[index];
  const next = messages[index + 1];

  if (!next) {
    return true;
  }

  if (current.role !== next.role) {
    return true;
  }

  const currentTime = new Date(current.createdAt).getTime();
  const nextTime = new Date(next.createdAt).getTime();

  if (Number.isNaN(currentTime) || Number.isNaN(nextTime)) {
    return true;
  }

  return Math.abs(nextTime - currentTime) >= 5 * 60 * 1000;
}

type ChatMessageListProps = {
  errorMessage?: string;
  isLoading: boolean;
  messages: ChatHistoryMessage[];
  isTyping?: boolean;
};

export function ChatMessageList({
  errorMessage,
  isLoading,
  messages,
  isTyping = false,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length === 0 && !isTyping) {
      return;
    }

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, isTyping]);

  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-0 flex-col overflow-y-auto pr-1">
        <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
          <LoaderCircle className="mr-2 size-4 animate-spin" />
          Loading chat history...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-1 min-h-0 flex-col overflow-y-auto pr-1">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-y-auto pr-1">
      <div className="space-y-4">
        <div className="flex justify-start">
          <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-none border border-border/70 bg-background px-4 py-3 text-sm leading-6 whitespace-pre-wrap break-words text-foreground sm:max-w-xl">
            <MarkdownMessage content={defaultConsultantMessage} />
          </div>
        </div>
        {messages.map((message, index) => (
          <div key={message.id} className="space-y-1">
            <div
              className={`flex ${
                message.role === "consultant" ? "justify-start" : "justify-end"
              }`}
            >
              <div className="w-fit max-w-[85%] sm:max-w-xl">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap break-words ${
                    message.role === "consultant"
                      ? "rounded-bl-none border border-border/70 bg-background text-foreground"
                      : "rounded-br-none bg-foreground text-background"
                  }`}
                >
                  {message.role === "consultant" ? (
                    <MarkdownMessage content={message.message} />
                  ) : (
                    message.message
                  )}
                </div>
              </div>
            </div>
            {shouldShowTimestamp(messages, index) ? (
              <div
                className={`flex ${
                  message.role === "consultant"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div className="px-1 text-xs text-muted-foreground">
                  {formatMessageDate(message.createdAt)}
                </div>
              </div>
            ) : null}
          </div>
        ))}
        {isTyping ? <TypingIndicator /> : null}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
