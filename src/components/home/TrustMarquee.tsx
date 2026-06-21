"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/lib/motion";

interface TrustMarqueeProps {
  totalJobs: number;
  cityCount: number;
  companyCount: number;
}

export function TrustMarquee({ totalJobs, cityCount, companyCount }: TrustMarqueeProps) {
  const displayJobs = totalJobs >= 1000 ? Math.floor(totalJobs / 100) * 100 : totalJobs;

  const items = [
    { value: displayJobs, suffix: totalJobs >= 1000 ? "+" : "", label: "offres actives" },
    { value: cityCount || 60, suffix: "", label: "villes" },
    { value: companyCount || 300, suffix: "+", label: "entreprises" },
    { value: 24, suffix: "/7", label: "mises à jour" },
  ];

  return (
    <section className="section-dark relative overflow-hidden border-y border-white/5 py-10 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(55,214,181,0.06),transparent_70%)]" />
      <div className="container-xl relative">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`text-center ${i === 1 ? "lg:translate-y-3" : i === 3 ? "lg:-translate-y-2" : ""}`}
            >
              <p className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                <AnimatedNumber value={item.value} suffix={item.suffix} />
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-muted">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
