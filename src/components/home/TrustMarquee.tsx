"use client";

import { motion } from "framer-motion";

interface TrustMarqueeProps {
  totalJobs: number;
  cityCount: number;
  companyCount: number;
}

export function TrustMarquee({ totalJobs, cityCount, companyCount }: TrustMarqueeProps) {
  const formatted =
    totalJobs >= 1000 ? `${Math.floor(totalJobs / 100) * 100}+` : String(totalJobs);

  const items = [
    { value: formatted, label: "offres actives" },
    { value: String(cityCount || 60), label: "villes" },
    { value: `${companyCount || 300}+`, label: "entreprises" },
    { value: "24/7", label: "mises à jour" },
  ];

  return (
    <section className="relative border-y border-white/5 bg-navy py-16">
      <div className="container-xl">
        <div className="grid grid-cols-2 gap-12 lg:grid-cols-4 lg:gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center lg:text-left"
            >
              <p className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
                {item.value}
              </p>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-muted">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
