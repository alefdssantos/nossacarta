import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip">
      <SiteHeader variant="internal" />
      <div className="flex-1">{children}</div>
      <SiteFooter variant="internal" />
    </div>
  );
}
