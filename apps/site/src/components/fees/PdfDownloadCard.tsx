import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { PdfAcrobatIcon } from "@/components/fees/PdfAcrobatIcon";
import { useState } from "react";

/**
 * Lien téléchargement PDF — format compact, icône type carte Adobe (rouge + pli + ruban blanc).
 */
export function PdfDownloadCard({ href, title, caption }: { href: string; title: string; caption: string }) {
  const [iconFailed, setIconFailed] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex max-w-full items-stretch overflow-hidden rounded-lg border border-border/90 bg-card text-left shadow-sm ring-1 ring-black/[0.04] transition-all duration-200 hover:-translate-y-px hover:border-[#dc2626]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:max-w-[min(100%,17.5rem)]"
      title={title}
    >
      <div className="relative flex w-11 shrink-0 items-center justify-center bg-gradient-to-b from-muted/30 to-muted/10 py-1" aria-hidden>
        {!iconFailed ? (
          <img
            src="/icons/pdf-adobe.png"
            alt=""
            className="h-[42px] w-[32px] shrink-0 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
            onError={() => setIconFailed(true)}
          />
        ) : (
          <PdfAcrobatIcon className="h-[38px] w-[29px] shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)]" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 sm:px-2.5 sm:py-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-xs">
            {title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-muted-foreground sm:line-clamp-1 sm:text-[10px]">
            {caption}
          </p>
        </div>
        <ArrowDownTrayIcon
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80 transition-colors group-hover:text-[#dc2626] sm:h-4 sm:w-4"
          strokeWidth={2}
          aria-hidden
        />
      </div>
    </a>
  );
}
