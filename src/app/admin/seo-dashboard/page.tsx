import {
  getDashboardBundle,
  getGrowthEngineBundle,
} from "@/lib/seo-engine";
import { buildPageMetadata } from "@/lib/seo";
import { ActionCenter } from "./components/ActionCenter";
import { DashboardTabs } from "./components/DashboardTabs";
import { GoogleJobsPanel } from "./components/GoogleJobsPanel";
import { GrowthEngineTab } from "./components/GrowthEngineTab";
import { SeoIntelligenceTab } from "./components/SeoIntelligenceTab";
import { IndexationPanel } from "./components/IndexationPanel";
import { PageQualityPanel } from "./components/PageQualityPanel";
import { RiskPanel } from "./components/RiskPanel";
import { SalaryPanel } from "./components/SalaryPanel";

export const metadata = {
  ...buildPageMetadata({
    title: "SEO Control Dashboard",
    description: "Internal SEO intelligence dashboard",
    path: "/admin/seo-dashboard",
    noindex: true,
  }),
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function SeoDashboardPage() {
  const [monitor, growth] = await Promise.all([
    getDashboardBundle(),
    getGrowthEngineBundle(),
  ]);

  const monitorContent = (
    <>
      <div className="mb-6">
        <ActionCenter />
      </div>
      <div className="grid gap-6">
        <IndexationPanel report={monitor.indexation} />
        <GoogleJobsPanel health={monitor.googleJobs} />
        <SalaryPanel matrix={monitor.salary} />
        <RiskPanel report={monitor.risk} />
        <PageQualityPanel stats={monitor.pageQuality} />
      </div>
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-mint-dim">
          Letravail.ma — SEO Brain
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy sm:text-3xl">
          SEO Control Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-dim">
          Monitoring + Growth Engine pour dominer le SEO emploi au Maroc.
          Données PostgreSQL en temps réel.
        </p>
        <p className="mt-1 text-xs text-slate-dim">
          Dernière mise à jour :{" "}
          {new Date(monitor.indexation.generatedAt).toLocaleString("fr-MA")}
        </p>
      </header>

      <DashboardTabs
        monitor={monitorContent}
        growth={<GrowthEngineTab data={growth} />}
        intelligence={<SeoIntelligenceTab intelligence={growth.intelligence} />}
      />
    </div>
  );
}
