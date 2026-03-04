import type { ReactNode } from "react";
import { ProtectedGuard } from "../../components/protected-guard";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <ProtectedGuard>{children}</ProtectedGuard>;
}
