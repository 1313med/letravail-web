"use client";

import Link from "next/link";
import { IntelActivationBadge, IntelHealthBadge, IntelPanel } from "@/components/intelligence/ui";
import type { LifecyclePipeline } from "@/lib/intelligence/repositories/discovery.repository";
import { formatPercent, formatScore, formatTimeInStage } from "@/lib/intelligence/formatters";

const STAGE_COLORS: Record<string, string> = {
  DISCOVERED: "border-slate-300 bg-slate-50",
  PROBED: "border-amber-200 bg-amber-50/50",
  VALIDATED: "border-teal-200 bg-teal-50/50",
  READY: "border-emerald-200 bg-emerald-50/50",
  ACTIVE: "border-blue-200 bg-blue-50/50",
  MONITORED: "border-violet-200 bg-violet-50/50",
};

export function EmployerLifecycleBoard({ pipeline }: { pipeline: LifecyclePipeline }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-dim">
        <span>{pipeline.total} employers tracked</span>
        <span className="hidden sm:inline">→</span>
        <span className="text-xs uppercase tracking-wide">Pipeline flow left to right</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[960px] gap-3">
          {pipeline.stages.map((column, idx) => (
            <div key={column.stage} className="flex min-w-[220px] flex-1 flex-col">
              <div
                className={`mb-2 rounded-xl border px-3 py-2 ${STAGE_COLORS[column.stage] ?? "border-navy/8 bg-white"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-navy">{column.stage}</p>
                  <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-navy">
                    {column.count}
                  </span>
                </div>
                {idx < pipeline.stages.length - 1 && (
                  <p className="mt-1 text-[10px] text-slate-dim">↓ next stage</p>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 rounded-xl border border-navy/8 bg-white p-2 min-h-[280px]">
                {column.employers.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-slate-dim">No employers</p>
                ) : (
                  column.employers.map((emp) => (
                    <Link
                      key={emp.id}
                      href={`/admin/intelligence/ats/${emp.id}`}
                      className="block rounded-lg border border-navy/8 bg-[#FAFBFC] p-3 transition hover:border-mint/30 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-navy leading-tight">{emp.companyName}</p>
                        <IntelActivationBadge state={column.stage} />
                      </div>
                      <p className="mt-1 text-xs text-slate-dim">{emp.atsPlatform}</p>
                      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                        <div>
                          <dt className="text-slate-dim">Confidence</dt>
                          <dd className="font-medium text-navy tabular-nums">
                            {formatPercent(emp.confidence * 100)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-dim">Health</dt>
                          <dd className="mt-0.5">
                            <IntelHealthBadge score={emp.healthScore} />
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-dim">Validation</dt>
                          <dd className="font-medium text-navy tabular-nums">
                            {formatScore(emp.validationScore)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-dim">Priority</dt>
                          <dd className="font-medium text-mint-dim tabular-nums">
                            {formatScore(emp.priority)}
                          </dd>
                        </div>
                      </dl>
                      <p className="mt-2 text-[10px] text-slate-dim">
                        In stage {formatTimeInStage(emp.timeInStageMs)}
                      </p>
                      {emp.activationReason && (
                        <p className="mt-1 line-clamp-2 text-[10px] text-slate-dim">
                          {emp.activationReason}
                        </p>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
