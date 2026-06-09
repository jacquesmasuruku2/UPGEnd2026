import { useCallback, useEffect, useId, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type GalleryRow = Database["public"]["Tables"]["gallery"]["Row"];

type GalleryLightboxProps = {
  open: boolean;
  items: GalleryRow[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
};

const wrapIndex = (i: number, len: number) => ((i % len) + len) % len;

/** Visionneuse plein écran UPG : navigation, fermeture, zoom au clic sur l’image. */
const GalleryLightbox = ({ open, items, index, onClose, onIndexChange }: GalleryLightboxProps) => {
  const titleId = useId();
  const [zoomed, setZoomed] = useState(false);

  const len = items.length;
  const safeIndex = len > 0 ? wrapIndex(index, len) : 0;
  const current = len > 0 ? items[safeIndex] : null;

  useEffect(() => {
    if (!open) return;
    setZoomed(false);
  }, [open, safeIndex]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const goPrev = useCallback(() => {
    if (len <= 1) return;
    setZoomed(false);
    onIndexChange(wrapIndex(safeIndex - 1, len));
  }, [len, onIndexChange, safeIndex]);

  const goNext = useCallback(() => {
    if (len <= 1) return;
    setZoomed(false);
    onIndexChange(wrapIndex(safeIndex + 1, len));
  }, [len, onIndexChange, safeIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose, open]);

  if (!open || !current) return null;

  const toggleZoom = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setZoomed((z) => !z);
  };

  const ui = (
    <div
      className="upg-gallery-lightbox__shell"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div className="upg-gallery-lightbox__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="upg-gallery-lightbox__close" onClick={onClose} aria-label="Fermer">
          <X className="h-7 w-7" strokeWidth={2} aria-hidden />
        </button>

        <figure className="upg-gallery-lightbox__figure">
          <button
            type="button"
            className="upg-gallery-lightbox__zoom-hit"
            onClick={toggleZoom}
            aria-label={zoomed ? "Réduire l’image" : "Agrandir l’image"}
          >
            <img
              className={`upg-gallery-lightbox__img ${zoomed ? "upg-gallery-lightbox__img--zoomed" : ""}`}
              src={current.image_url}
              alt={current.title}
              decoding="async"
            />
          </button>
          <figcaption className="upg-gallery-lightbox__caption">
            <span id={titleId}>{current.title}</span>
          </figcaption>
        </figure>
      </div>

      {len > 1 ? (
        <>
          <button
            type="button"
            className="upg-gallery-lightbox__nav upg-gallery-lightbox__nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Image précédente"
          >
            <ChevronLeft className="h-10 w-10" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            className="upg-gallery-lightbox__nav upg-gallery-lightbox__nav--next"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Image suivante"
          >
            <ChevronRight className="h-10 w-10" strokeWidth={2} aria-hidden />
          </button>
        </>
      ) : null}
    </div>
  );

  return createPortal(ui, document.body);
};

export default GalleryLightbox;
