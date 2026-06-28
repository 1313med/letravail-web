import type { Metadata } from "next";
import { IntelligenceShell, IntelligenceMobileNav } from "@/components/intelligence/IntelligenceShell";
import { DiscoveryProbeForm } from "@/components/ats/DiscoveryProbeForm";
import { EmployerLifecycleBoard } from "@/components/intelligence/EmployerLifecycleBoard";
import { IntelPanel } from "@/components/intelligence/ui";
import { getEmployerLifecyclePipeline } from "@/lib/intelligence";

export const metadata: Metadata = {
  title: "Employer Discovery — Employment Intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  const pipeline = await getEmployerLifecyclePipeline();

  return (
    <>
      <IntelligenceShell
        title="Employer Discovery"
        subtitle="Visualize the employer activation pipeline — where each employer sits and what needs attention next."
      >
        <div className="space-y-6 pb-20 lg:pb-6">
          <DiscoveryProbeForm />

          <IntelPanel
            title="Employer Lifecycle Pipeline"
            subtitle="DISCOVERED → PROBED → VALIDATED → READY → ACTIVE → MONITORED"
            accent="green"
          >
            <EmployerLifecycleBoard pipeline={pipeline} />
          </IntelPanel>
        </div>
      </IntelligenceShell>
      <IntelligenceMobileNav />
    </>
  );
}
