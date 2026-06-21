"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/premium-data";
import { TESTIMONIAL_AVATARS } from "@/lib/city-images";

export function TestimonialsGallery() {
  return (
    <section className="story-section">
      <div className="container-xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">Témoignages</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Des vies changées
          </h2>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
            >
              <div className="absolute -right-4 -top-4 text-8xl font-serif text-mint/5">&ldquo;</div>
              <p className="relative text-[15px] leading-relaxed text-slate-text">
                {t.quote}
              </p>
              <footer className="relative mt-8 flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-mint/20">
                  <Image
                    src={TESTIMONIAL_AVATARS[i]}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <cite className="not-italic font-semibold text-white">{t.name}</cite>
                  <p className="text-sm text-slate-muted">{t.role}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
