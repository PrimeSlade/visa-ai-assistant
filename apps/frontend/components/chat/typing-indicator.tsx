"use client";

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex min-h-9 w-fit items-center gap-1 rounded-2xl rounded-bl-none border border-border/70 bg-background px-4 py-2">
        <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
        <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
        <span className="size-2 rounded-full bg-muted-foreground/60 animate-bounce" />
      </div>
    </div>
  );
}
