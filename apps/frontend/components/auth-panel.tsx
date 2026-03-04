"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { authClient } from "../lib/auth-client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type Mode = "sign-in" | "sign-up";
type Notice = {
  tone: "success" | "error";
  message: string;
} | null;

const defaultSignIn = {
  email: "",
  password: "",
};

const defaultSignUp = {
  name: "",
  email: "",
  password: "",
};

function getErrorMessage(error: { message?: string } | null | undefined) {
  return error?.message ?? "Something went wrong. Please try again.";
}

export function AuthPanel() {
  const router = useRouter();
  const {
    data: session,
    isPending: isSessionPending,
    error: sessionError,
  } = authClient.useSession();
  const [mode, setMode] = useState<Mode>("sign-up");
  const [signInValues, setSignInValues] = useState(defaultSignIn);
  const [signUpValues, setSignUpValues] = useState(defaultSignUp);
  const [notice, setNotice] = useState<Notice>(null);
  const [isSubmitting, startTransition] = useTransition();

  useEffect(() => {
    if (session?.user) {
      router.replace("/chat");
    }
  }, [router, session?.user]);

  const handleSignUp = () => {
    startTransition(() => {
      void (async () => {
        setNotice(null);

        const { error } = await authClient.signUp.email({
          name: signUpValues.name,
          email: signUpValues.email,
          password: signUpValues.password,
        });

        if (error) {
          setNotice({
            tone: "error",
            message: getErrorMessage(error),
          });
          return;
        }

        setSignUpValues(defaultSignUp);
        router.push("/chat");
      })();
    });
  };

  const handleSignIn = () => {
    startTransition(() => {
      void (async () => {
        setNotice(null);

        const { error } = await authClient.signIn.email({
          email: signInValues.email,
          password: signInValues.password,
          rememberMe: true,
        });

        if (error) {
          setNotice({
            tone: "error",
            message: getErrorMessage(error),
          });
          return;
        }

        setSignInValues(defaultSignIn);
        router.push("/chat");
      })();
    });
  };

  const handleSignOut = () => {
    startTransition(() => {
      void (async () => {
        setNotice(null);

        const { error } = await authClient.signOut();

        if (error) {
          setNotice({
            tone: "error",
            message: getErrorMessage(error),
          });
          return;
        }

        setNotice({
          tone: "success",
          message: "Signed out.",
        });
      })();
    });
  };

  const disabled = isSubmitting || isSessionPending;

  return (
    <Card className="border-border/70 bg-card/90 shadow-lg shadow-black/5 backdrop-blur supports-[backdrop-filter]:bg-card/75 lg:sticky lg:top-8">
      <CardHeader className="gap-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl tracking-tight">Sign in to your account</CardTitle>
          <CardDescription className="max-w-sm text-sm leading-6">
            Access your conversations, updates, and visa guidance in one
            secure place.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as Mode)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-up">Create account</TabsTrigger>
            <TabsTrigger value="sign-in">Sign in</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-up" className="mt-5">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleSignUp();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Saiza"
                  value={signUpValues.name}
                  onChange={(event) =>
                    setSignUpValues((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sign-up-email">Email</Label>
                <Input
                  id="sign-up-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={signUpValues.email}
                  onChange={(event) =>
                    setSignUpValues((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sign-up-password">Password</Label>
                <Input
                  id="sign-up-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={signUpValues.password}
                  onChange={(event) =>
                    setSignUpValues((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <Button className="w-full" type="submit" disabled={disabled}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Creating account
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sign-in" className="mt-5">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleSignIn();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="sign-in-email">Email</Label>
                <Input
                  id="sign-in-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={signInValues.email}
                  onChange={(event) =>
                    setSignInValues((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sign-in-password">Password</Label>
                <Input
                  id="sign-in-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={signInValues.password}
                  onChange={(event) =>
                    setSignInValues((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <Button className="w-full" type="submit" disabled={disabled}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Signing in
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {notice ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.message}
          </div>
        ) : null}

        {sessionError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            We couldn't verify your session right now. {getErrorMessage(sessionError)}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
