import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

const starterPrompts = [
  "Am I eligible for the Thailand DTV visa?",
  "What documents should I prepare first?",
  "Can you review my situation before I apply?",
];

type StarterPromptListProps = {
  onSelect: (prompt: string) => void;
};

export function StarterPromptList({ onSelect }: StarterPromptListProps) {
  return (
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
            onClick={() => onSelect(prompt)}
          >
            {prompt}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
