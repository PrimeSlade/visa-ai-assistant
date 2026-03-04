"use client";

import { Bot, LoaderCircle, LogOut, SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { authClient } from "../../../lib/auth-client";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

const starterPrompts = [
  "Am I eligible for the Thailand DTV visa?",
  "What documents should I prepare first?",
  "Can you review my situation before I apply?",
];

type Message = {
  id: string;
  role: "client" | "consultant";
  content: string;
};

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "consultant",
    content:
      "Hello. I can help you understand the Thailand DTV process, required documents, eligibility questions, and application preparation. What would you like to start with?",
  },
];

function createMessage(role: Message["role"], content: string): Message {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    content,
  };
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSigningOut, startTransition] = useTransition();

  const sendMessage = (content: string) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    const userMessage = createMessage("client", trimmedContent);

    setMessages((current) => [...current, userMessage]);
    setInput("");
  };

  const handleSignOut = () => {
    startTransition(() => {
      void (async () => {
        const { error } = await authClient.signOut();

        if (error) {
          return;
        }

        router.replace("/");
      })();
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-border/70 py-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Visa chat</h1>
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
            <Card className="border-border/70 bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">Start with</CardTitle>
                <CardDescription>
                  Quick prompts to begin the conversation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-accent"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </CardContent>
            </Card>
          </aside>

          <Card className="flex min-h-[680px] flex-col border-border/70 bg-card/80">
            <CardHeader className="border-b border-border/70">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-background">
                  <Bot className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Thailand DTV Assistant
                  </CardTitle>
                  <CardDescription>
                    Tell me about your situation and I will guide you from
                    there.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "consultant"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`w-fit max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap break-words sm:max-w-xl ${
                        message.role === "consultant"
                          ? "border border-border/70 bg-background text-foreground"
                          : "bg-foreground text-background"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-10">
                <form
                  className="rounded-2xl border border-border/70 bg-background p-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage(input);
                  }}
                >
                  <div className="flex items-end gap-3">
                    <Input
                      placeholder="Type your message here..."
                      className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                    />
                      <Button
                        size="icon"
                        className="shrink-0 rounded-md"
                        type="submit"
                        disabled={!input.trim()}
                      >
                      <SendHorizonal className="size-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
