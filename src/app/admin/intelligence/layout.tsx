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
  return (
    <div className="min-h-screen bg-[#030912]">
      {/* Override admin light background */}
      <div className="fixed inset-0 -z-10 bg-[#030912]" />
      <div className="fixed inset-0 -z-10 hero-aurora opacity-40" />
      {children}
    </div>
  );
}
