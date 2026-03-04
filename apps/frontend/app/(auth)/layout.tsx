import type { ReactNode } from "react";
import { AuthGuard } from "../../components/auth-guard";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
