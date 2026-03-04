import { LoaderCircle, SendHorizonal } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type ChatComposerProps = {
  input: string;
  isFetching: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function ChatComposer({
  input,
  isFetching,
  onChange,
  onSubmit,
}: ChatComposerProps) {
  return (
    <form
      className="rounded-2xl border border-border/70 bg-background p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex items-end gap-3">
        <Input
          placeholder="Type your message here..."
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          value={input}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          size="icon"
          className="shrink-0 rounded-md"
          type="submit"
          disabled={!input.trim()}
        >
          {isFetching ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <SendHorizonal className="size-4" />
          )}
        </Button>
      </div>
    </form>
  );
}
