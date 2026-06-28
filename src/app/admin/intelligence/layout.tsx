import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employment Intelligence Center",
  robots: { index: false, follow: false },
};

export default function IntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
