"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { getCityImage } from "@/lib/city-images";
import { TiltCard, fadeUp, stagger } from "@/lib/motion";
import { pluralize } from "@/lib/utils";

interface City {
  city: string;
  slug: string;
  _count: { jobs: number };
}

interface CityCarouselProps {
  cities: City[];
}

export function CityCarousel({ cities }: CityCarouselProps) {
  const [hero, second, third, ...rest] = cities;

  return (
    <section className="section-light story-section overflow-hidden">
      <div className="container-xl">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mx-auto max-w-4xl text-center">
          <motion.p variants={fadeUp} className="section-label-light">Explorer le royaume</motion.p>
          <motion.h2 variants={fadeUp} className="display-section mt-6 text-navy">
            Où commence
            <br />
            <span className="text-navy/40">votre aventure ?</span>
          </motion.h2>
        </motion.div>

        {/* Asymmetric magazine — hero left, two stacked offset right */}
        <div className="mt-10 grid gap-4 sm:mt-16 sm:gap-6 lg:grid-cols-12 lg:gap-8 lg:items-start">
          {hero && (() => {
            const img = getCityImage(hero.slug, hero.city);
            return (
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }} className="lg:col-span-7">
                <TiltCard>
                  <Link href={`/emplois/${hero.slug}`} className="group relative block h-[320px] overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(6,23,47,0.18)] sm:h-[420px] sm:rounded-[2rem] lg:h-[580px]">
                    <Image src={img.src} alt={img.alt} fill priority className="object-cover transition-transform duration-[1.4s] group-hover:scale-105" sizes="(max-width:1024px) 100vw, 60vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
                      <span className="badge-mint-dark">Ville #1</span>
                      <p className="mt-4 text-3xl font-extrabold text-white sm:mt-6 sm:text-5xl lg:text-7xl">{hero.city}</p>
                      <p className="mt-2 text-base text-white/75 sm:mt-3 sm:text-xl">{pluralize(hero._count.jobs, "opportunité", "opportunités")}</p>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            );
          })()}

          <div className="flex flex-col gap-6 lg:col-span-5 lg:translate-y-12">
            {[second, third].filter(Boolean).map((city, i) => {
              const img = getCityImage(city!.slug, city!.city);
              return (
                <motion.div key={city!.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.12 }} className={i === 1 ? "lg:ml-8" : ""}>
                  <TiltCard>
                    <Link href={`/emplois/${city!.slug}`} className="group relative block h-[180px] overflow-hidden rounded-2xl shadow-lg sm:h-[220px] sm:rounded-3xl lg:h-[260px]">
                      <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="400px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <p className="text-2xl font-bold text-white">{city!.city}</p>
                        <p className="text-sm text-white/70">{pluralize(city!._count.jobs, "offre", "offres")}</p>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll row — varied heights for asymmetry */}
      <div className="mt-10 flex snap-x snap-mandatory items-end gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mt-14 sm:gap-6 sm:px-6 lg:px-12">
        {rest.slice(0, 6).map((city, i) => {
          const img = getCityImage(city.slug, city.city);
          const h = i % 3 === 0 ? "h-[240px] sm:h-[320px]" : i % 3 === 1 ? "h-[220px] sm:h-[280px]" : "h-[260px] sm:h-[360px]";
          const offset = i % 2 === 0 ? "" : "translate-y-6";
          return (
            <motion.div key={city.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className={`shrink-0 snap-start ${offset}`}>
              <Link href={`/emplois/${city.slug}`} className={`group relative block w-[200px] overflow-hidden rounded-2xl shadow-md sm:w-[260px] sm:rounded-3xl ${h}`}>
                <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="260px" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/75 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xl font-bold text-white">{city.city}</p>
                  <ArrowUpRight className="mt-2 h-4 w-4 text-mint opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
