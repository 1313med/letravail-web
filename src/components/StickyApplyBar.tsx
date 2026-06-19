"use client";

interface StickyApplyBarProps {
  applicationUrl: string;
  company: string;
}

export function StickyApplyBar({ applicationUrl, company }: StickyApplyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 p-4 shadow-[0_-4px_24px_rgba(11,18,32,0.08)] backdrop-blur-xl lg:hidden">
      <a
        href={applicationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary flex w-full justify-center py-3.5"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        Postuler chez {company}
      </a>
    </div>
  );
}
