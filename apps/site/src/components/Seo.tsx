import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSeoForPath, isKnownRoute, SITE_URL } from "@/config/seo";
import { LOGO_UPG_ABSOLUTE_URL } from "@/lib/brand";
import { toAbsoluteOgImage } from "@/lib/seoOg";
import { supabase } from "@/integrations/supabase/client";

const CANONICAL_ID = "seo-canonical";
const META_DESC_ID = "seo-meta-description";
const META_ROBOTS_ID = "seo-robots";

function upsertMetaByName(name: string, content: string, id?: string) {
  let el: HTMLMetaElement | null = null;
  if (id) {
    el = document.querySelector(`meta[name="${name}"]#${id}`) as HTMLMetaElement | null;
  }
  if (!el) {
    el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    if (id) el.id = id;
    document.head.appendChild(el);
  } else if (id && !el.id) {
    el.id = id;
  }
  el.setAttribute("content", content);
}

function upsertMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLinkCanonical(href: string) {
  let el = document.getElementById(CANONICAL_ID) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.id = CANONICAL_ID;
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Met à jour titre, description, canonical et balises Open Graph à chaque navigation (SPA).
 */
const Seo = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    let cancelled = false;

    const applyMeta = (
      meta: { title: string; description: string; noindex?: boolean },
      canonicalUrl: string,
      ogImage: string,
    ) => {
      if (cancelled) return;

      document.title = meta.title;

      upsertMetaByName("description", meta.description, META_DESC_ID);

      const noindex = meta.noindex || !isKnownRoute(pathname);
      let robotsEl = document.getElementById(META_ROBOTS_ID) as HTMLMetaElement | null;
      if (!robotsEl) {
        robotsEl = document.createElement("meta");
        robotsEl.id = META_ROBOTS_ID;
        robotsEl.setAttribute("name", "robots");
        document.head.appendChild(robotsEl);
      }
      robotsEl.setAttribute("content", noindex ? "noindex, follow" : "index, follow");

      upsertLinkCanonical(canonicalUrl);

      upsertMetaProperty("og:title", meta.title);
      upsertMetaProperty("og:description", meta.description);
      upsertMetaProperty("og:url", canonicalUrl);
      upsertMetaProperty("og:image", ogImage);

      upsertMetaByName("twitter:title", meta.title);
      upsertMetaByName("twitter:description", meta.description);
      upsertMetaByName("twitter:image", ogImage);

      document.documentElement.lang = "fr";
    };

    const baseMeta = getSeoForPath(pathname, search);
    const qs = search || "";
    const pathPart = pathname === "/" ? "" : pathname;
    const canonicalUrl = `${SITE_URL}${pathPart}${qs}`;
    applyMeta(baseMeta, canonicalUrl, LOGO_UPG_ABSOLUTE_URL);

    const run = async () => {
      let title = baseMeta.title;
      let description = baseMeta.description;
      let ogImage = LOGO_UPG_ABSOLUTE_URL;

      const params = new URLSearchParams(search);

      if (pathname === "/blog") {
        const articleId = params.get("article");
        if (articleId) {
          const { data } = await supabase
            .from("blog_articles")
            .select("image_url, title, excerpt")
            .eq("id", articleId)
            .maybeSingle();
          if (!cancelled && data) {
            title = `${data.title} | Université Polytechnique de Goma`;
            if (data.excerpt?.trim()) {
              description = data.excerpt.trim().slice(0, 300);
            }
            const abs = toAbsoluteOgImage(data.image_url);
            if (abs) ogImage = abs;
          }
        }
      }

      if (pathname === "/college-etudiants") {
        const postId = params.get("post");
        if (postId) {
          const { data } = await supabase
            .from("college_posts")
            .select("image_url, title, content")
            .eq("id", postId)
            .maybeSingle();
          if (!cancelled && data) {
            title = `${data.title} | Collège des étudiants — UPG`;
            const plain =
              data.content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
            if (plain) description = plain.slice(0, 300);
            const abs = toAbsoluteOgImage(data.image_url);
            if (abs) ogImage = abs;
          }
        }
      }

      applyMeta({ ...baseMeta, title, description }, canonicalUrl, ogImage);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [pathname, search]);

  return null;
};

export default Seo;
