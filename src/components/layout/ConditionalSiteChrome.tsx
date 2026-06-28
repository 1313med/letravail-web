"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PremiumHeader, MobileBottomNav, AiAssistant } from "@/components/premium/Navigation";
import { PremiumFooter } from "@/components/premium/Footer";

export function ConditionalSiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <PremiumHeader />
      <main className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      <PremiumFooter />
      <MobileBottomNav />
      <AiAssistant />
    </>
  );
}
