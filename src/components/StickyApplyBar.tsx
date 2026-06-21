"use client";

interface StickyApplyBarProps {
  applicationUrl: string;
  company: string;
}

export function StickyApplyBar({ applicationUrl, company }: StickyApplyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-white/10 bg-navy/95 p-4 backdrop-blur-2xl lg:hidden">
      <a href={applicationUrl} target="_blank" rel="noopener noreferrer" className="btn-mint flex w-full justify-center !py-3.5">
        Postuler chez {company}
      </a>
    </div>
  );
}
