import { TESTIMONIALS } from "@/lib/premium-data";

export function TestimonialsSection() {
  return (
    <section className="section-padding">
      <div className="container-xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">Témoignages</p>
          <h2 className="heading-lg mt-4">Ils nous font confiance</h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote key={t.name} className="card-glass p-8">
              <p className="text-sm leading-relaxed text-slate-text">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6 flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint/10 text-sm font-bold text-mint">
                  {t.avatar}
                </span>
                <div>
                  <cite className="not-italic font-semibold text-white">{t.name}</cite>
                  <p className="text-xs text-slate-muted">{t.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
