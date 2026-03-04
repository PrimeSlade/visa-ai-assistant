import { ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { AuthPanel } from "../../../components/auth-panel";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Private and secure",
    description:
      "Your account stays protected with a secure sign-in flow designed for day-to-day use.",
  },
  {
    icon: Workflow,
    title: "Clear next steps",
    description:
      "Keep your visa questions, documents, and conversations organized in one place.",
  },
  {
    icon: Sparkles,
    title: "Calm experience",
    description:
      "A simple interface that stays focused on progress, not clutter.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid flex-1 items-center gap-6 py-10 lg:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="space-y-6">
            <div className="space-y-5">
              <div className="max-w-3xl space-y-4">
                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Manage your visa journey with clarity and confidence.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Sign in to continue your conversations, review guidance, and
                  keep every step of your Thailand DTV process in one secure
                  workspace.
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    className="border-border/70 bg-card/75 shadow-sm"
                  >
                    <CardHeader className="gap-4">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background">
                        <Icon className="size-4" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg tracking-tight">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-6">
                          {item.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <Card className="border-border/70 bg-card/75 shadow-sm">
              <CardHeader className="gap-2">
                <CardTitle className="text-xl tracking-tight">
                  Built for real client use
                </CardTitle>
                <CardDescription className="max-w-2xl leading-6">
                  This space is designed to feel trustworthy, quiet, and easy to
                  return to whenever you need visa support.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
                <div className="space-y-2">
                  <p className="font-medium text-foreground">
                    One secure account
                  </p>
                  <p>
                    Keep your history and progress connected to a single login.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">
                    Focused workspace
                  </p>
                  <p>
                    Find the guidance you need without distractions or crowded
                    layouts.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">
                    Ready to continue
                  </p>
                  <p>
                    Pick up exactly where you left off each time you come back.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <AuthPanel />
        </section>
      </div>
    </main>
  );
}
