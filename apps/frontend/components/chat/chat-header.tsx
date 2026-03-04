import { Bot } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "../ui/card";

export function ChatHeader() {
  return (
    <CardHeader className="border-b border-border/70">
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
    </CardHeader>
  );
}
