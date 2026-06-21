"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { getCityImage } from "@/lib/city-images";
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
  return (
    <section className="story-section overflow-hidden">
      <div className="container-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-label"
            >
              Explorer
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Où voulez-vous
              <br />
              <span className="text-slate-muted">travailler ?</span>
            </motion.h2>
          </div>
          <Link
            href="/emplois"
            className="group hidden items-center gap-2 text-sm font-semibold text-mint lg:flex"
          >
            Toutes les villes
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* Horizontal carousel — Airbnb style */}
      <div className="mt-16">
        <div className="flex gap-6 overflow-x-auto px-5 pb-4 snap-x snap-mandatory scrollbar-hide sm:px-8 lg:px-12 lg:gap-8">
          {cities.slice(0, 8).map((city, i) => {
            const img = getCityImage(city.slug, city.city);
            return (
              <motion.div
                key={city.slug}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                className="snap-start shrink-0"
              >
                <Link
                  href={`/emplois/${city.slug}`}
                  className="group relative block h-[420px] w-[300px] overflow-hidden rounded-3xl sm:h-[480px] sm:w-[340px]"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="340px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
                  <div className="absolute inset-0 bg-navy/0 transition-colors duration-500 group-hover:bg-mint/5" />

                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <p className="text-3xl font-bold text-white">{city.city}</p>
                    <p className="mt-2 text-sm text-slate-text">
                      {pluralize(city._count.jobs, "offre", "offres")}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-mint opacity-0 transition-all duration-300 group-hover:opacity-100">
                      Explorer
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
