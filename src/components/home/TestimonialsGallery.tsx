"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/premium-data";
import { TESTIMONIAL_AVATARS } from "@/lib/city-images";
import { TiltCard, fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function TestimonialsGallery() {
  return (
    <section className="section-white story-section overflow-hidden">
      <div className="container-xl">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mx-auto max-w-3xl text-center">
          <motion.p variants={fadeUp} className="section-label-light">Histoires vraies</motion.p>
          <motion.h2 variants={fadeUp} className="display-section mt-6 text-navy">
            Des vies
            <br />
            <span className="text-navy/40">transformées.</span>
          </motion.h2>
        </motion.div>

        {/* Asymmetric — center card elevated & larger */}
        <div className="relative mt-10 grid gap-6 sm:mt-16 md:grid-cols-3 md:items-center lg:mt-20 lg:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={cn(
                i === 0 && "md:translate-y-8",
                i === 1 && "md:-translate-y-10 md:scale-105 md:z-10",
                i === 2 && "md:translate-y-6"
              )}
            >
              <TiltCard>
                <blockquote className={cn(
                  "relative flex flex-col overflow-hidden rounded-2xl border border-navy/6 bg-[#F7F9FC] p-6 sm:rounded-[2rem] sm:p-10",
                  i === 1 && "shadow-[0_32px_80px_rgba(6,23,47,0.12)] ring-1 ring-mint/20"
                )}>
                  <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full ring-4 ring-white shadow-xl sm:h-24 sm:w-24">
                    <Image src={TESTIMONIAL_AVATARS[i]} alt={t.name} fill className="object-cover" sizes="96px" />
                  </div>
                  <p className="relative mt-8 flex-1 text-center text-base leading-relaxed text-navy/65 sm:text-lg">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="relative mt-8 text-center">
                    <cite className="not-italic text-lg font-bold text-navy">{t.name}</cite>
                    <p className="mt-1 text-sm text-navy/40">{t.role}</p>
                  </footer>
                </blockquote>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
