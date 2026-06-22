import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@heroicons/react/24/outline";
import type { Database } from "@/integrations/supabase/types";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import "@/styles/upg-gallery.css";

export type GalleryRow = Database["public"]["Tables"]["gallery"]["Row"];

type GalleryViewerProps = {
  items: GalleryRow[];
};

type GalleryGroup = {
  key: string;
  eyebrow: string;
  title: string;
  blurb: string | null;
  items: GalleryRow[];
};

const sortKey = (row: GalleryRow) => row.display_order ?? 0;

const buildGroups = (rows: GalleryRow[]): GalleryGroup[] => {
  const sorted = [...rows].sort((a, b) => {
    const o = sortKey(a) - sortKey(b);
    if (o !== 0) return o;
    return (a.title || "").localeCompare(b.title || "");
  });

  const catKeys = new Set(
    sorted.map((r) => (r.category && r.category.trim() ? r.category.trim() : "")),
  );
  const hasMultipleCategories = [...catKeys].filter(Boolean).length > 1;

  if (!hasMultipleCategories) {
    const first = sorted[0];
    const title = (first?.category && first.category.trim()) || "Galerie photos";
    const blurb =
      sorted.map((r) => r.description?.trim()).find((t): t is string => Boolean(t)) ?? null;
    return [{ key: "__all__", eyebrow: "UPG", title, blurb, items: sorted }];
  }

  const map = new Map<string, GalleryRow[]>();
  for (const row of sorted) {
    const k = row.category?.trim() || "Autres";
    const list = map.get(k);
    if (list) list.push(row);
    else map.set(k, [row]);
  }

  const orderedKeys = [...new Set(sorted.map((r) => r.category?.trim() || "Autres"))];

  return orderedKeys.map((key) => {
    const groupItems = map.get(key) ?? [];
    const blurb =
      groupItems.map((r) => r.description?.trim()).find((t): t is string => Boolean(t)) ?? null;
    return {
      key,
      eyebrow: "UPG",
      title: key,
      blurb,
      items: groupItems,
    };
  });
};

const GalleryViewer = ({ items }: GalleryViewerProps) => {
  const groups = useMemo(() => buildGroups(items), [items]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openAt = (row: GalleryRow) => {
    const idx = flat.findIndex((r) => r.id === row.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  return (
    <div className="upg-gallery-root space-y-16 sm:space-y-20">
      {groups.map((group) => (
        <section key={group.key} className="space-y-6 sm:space-y-8">
          <header className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{group.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{group.title}</h2>
            {group.blurb ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{group.blurb}</p>
            ) : null}
          </header>

          <div className="upg-gallery-grid" role="list">
            {group.items.map((img) => (
              <div key={img.id} className="upg-gallery-grid__cell" role="listitem">
                <article className="upg-gallery-tile">
                  <div className="upg-gallery-tile__thumb">
                    <img loading="lazy" decoding="async" src={img.image_url} alt={img.title} width={300} height={200} />
                  </div>
                  <div className="upg-gallery-tile__overlay">
                    <div className="upg-gallery-tile__scrim" aria-hidden />
                    <div className="upg-gallery-tile__inner">
                      <div className="upg-gallery-tile__actions">
                        <button
                          type="button"
                          className="upg-gallery-tile__zoom"
                          aria-label={`Agrandir : ${img.title}`}
                          onClick={() => openAt(img)}
                        >
                          <MagnifyingGlassIcon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </section>
      ))}

      <GalleryLightbox
        open={lightboxOpen}
        items={flat}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
};

export default GalleryViewer;
