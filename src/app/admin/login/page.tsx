import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  isAdminConfigured,
  verifyAdminToken,
} from "@/lib/admin-auth";
import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  if (!isAdminConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-navy">Admin non configuré</h1>
          <p className="mt-2 text-sm text-slate-dim">
            Définissez la variable d&apos;environnement{" "}
            <code className="rounded bg-navy/5 px-1">ADMIN_SECRET</code> pour
            activer le tableau de bord SEO.
          </p>
        </div>
      </div>
    );
  }

  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (verifyAdminToken(token)) {
    redirect(searchParams.from || "/admin/seo-dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-navy">Letravail Admin</h1>
        <p className="mt-1 text-sm text-slate-dim">
          Accès sécurisé — SEO Dashboard & Intelligence Center
        </p>
        <div className="mt-4 flex gap-2 text-xs">
          <a href="/admin/seo-dashboard" className="text-mint-dim hover:text-mint">
            SEO Dashboard
          </a>
          <span className="text-slate-dim">·</span>
          <a href="/admin/intelligence" className="text-mint-dim hover:text-mint">
            Intelligence Center
          </a>
        </div>
        <AdminLoginForm redirectTo={searchParams.from || "/admin/seo-dashboard"} />
      </div>
    </div>
  );
}
