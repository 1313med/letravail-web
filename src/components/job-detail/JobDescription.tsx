import { JobSection } from "@/lib/job-detail";

export function JobDescription({ sections }: { sections: JobSection[] }) {
  return (
    <section className="mb-8 sm:mb-14">
      <p className="section-label text-[10px] sm:text-xs">Le poste</p>
      <h2 className="mt-1.5 text-lg font-extrabold text-white sm:mt-3 sm:text-3xl">Description détaillée</h2>
      <div className="mt-5 space-y-8 sm:mt-10 sm:space-y-12">
        {sections.map((section) => (
          <article key={section.id} className="scroll-mt-28">
            <h3 className="text-base font-bold text-white sm:text-2xl">{section.title}</h3>
            <div className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.75] text-slate-text/90 sm:mt-5 sm:text-[17px] sm:leading-[1.9]">
              {section.content.split(/\n\n+/).map((para, i) => (
                <p key={i} className={i > 0 ? "mt-4 sm:mt-5" : ""}>{para.trim()}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
