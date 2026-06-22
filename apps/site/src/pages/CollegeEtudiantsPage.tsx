import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import RichContent from "@/components/RichContent";
import SocialShareButtons from "@/components/SocialShareButtons";
import { UsersIcon, MegaphoneIcon, CalendarDaysIcon, ChevronRightIcon, EyeIcon, HeartIcon } from "@heroicons/react/24/outline";
import {
  useCollegePosts,
  useBlogArticles,
  useIncrementCollegePostLikes,
  useIncrementCollegePostViews,
} from "@/hooks/useSupabaseData";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link, useSearchParams } from "react-router-dom";

const MAX_CHARS = 200;

/** Aperçu texte brut pour « Lire plus » (tronqué, sans balises) */
function previewPlainMd(source: string, max: number): string {
  let t = source.replace(/^:::.*\n?/m, "");
  t = t
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^##\s+/gm, "")
    .replace(/^-\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "");
  t = t.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trim() + "…";
}

const CollegeEtudiantsPage = () => {
  const { data: posts } = useCollegePosts(true);
  const { data: articles } = useBlogArticles(true);
  const incViews = useIncrementCollegePostViews();
  const incLikes = useIncrementCollegePostLikes();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const viewedPostsRef = useRef<Set<string>>(new Set());
  /** Publications pour lesquelles la liste complète des titres suivants est affichée (après clic sur « Publication suivante »). */
  const [fullOthersListForPostIds, setFullOthersListForPostIds] = useState<Set<string>>(() => new Set());

  /** Ouvre une publication, met à jour l’URL et fait défiler jusqu’à la carte. */
  const goToCollegePost = (
    targetId: string,
    options?: { collapseId?: string; unlockFullOthersListOnTarget?: boolean }
  ) => {
    if (!viewedPostsRef.current.has(targetId)) {
      viewedPostsRef.current.add(targetId);
      incViews.mutate(targetId);
    }
    if (options?.unlockFullOthersListOnTarget) {
      setFullOthersListForPostIds((prev) => new Set(prev).add(targetId));
    }
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (options?.collapseId) next.delete(options.collapseId);
      next.add(targetId);
      return next;
    });
    setSearchParams({ post: targetId }, { replace: true });
    window.setTimeout(() => {
      document.getElementById(`college-post-${targetId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  useEffect(() => {
    const postId = searchParams.get("post");
    if (!postId || !posts?.length) return;
    const exists = posts.some((p) => p.id === postId);
    if (!exists) return;
    if (!viewedPostsRef.current.has(postId)) {
      viewedPostsRef.current.add(postId);
      incViews.mutate(postId);
    }
    setExpandedIds((prev) => new Set(prev).add(postId));
    const t = window.setTimeout(() => {
      document.getElementById(`college-post-${postId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(t);
  }, [searchParams, posts]);

  useEffect(() => {
    if (!posts?.length) return;
    const next = new Set<string>();
    posts.forEach((p) => {
      if (localStorage.getItem(`college-liked-${p.id}`) === "1") next.add(p.id);
    });
    setLikedPosts(next);
  }, [posts]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        if (!viewedPostsRef.current.has(id)) {
          viewedPostsRef.current.add(id);
          incViews.mutate(id);
        }
      }
      return next;
    });
  };

  return (
    <Layout>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <AnimatedSection>
            <h1 className="text-3xl font-bold text-primary mb-2 text-center">
              Collège des Étudiants
            </h1>
            <p className="text-muted-foreground text-center mb-10">
              Représentation et vie estudiantine à l'UPG
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: UsersIcon, title: "Comité Exécutif", text: "Le comité estudiantin représente les intérêts de tous les étudiants auprès de l'administration." },
              { icon: MegaphoneIcon, title: "Annonces", text: "Retrouvez ici toutes les communications et annonces du collège des étudiants." },
              { icon: CalendarDaysIcon, title: "Événements", text: "Activités culturelles, sportives et académiques organisées par les étudiants." },
            ].map((card, i) => (
              <AnimatedSection key={card.title} delay={i * 0.15}>
                <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-upg-sky-light flex items-center justify-center">
                    <card.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{card.title}</h3>
                  <p className="text-muted-foreground text-sm">{card.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {posts && posts.length > 0 ? (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold text-foreground text-center mb-4">Publications Récentes</h2>
                  {posts.map((p, i) => {
                    const isLong = (p.content?.length || 0) > MAX_CHARS;
                    const isExpanded = expandedIds.has(p.id);
                    const showFullRich = !isLong || isExpanded;
                    const remainingPosts = posts.slice(i + 1);
                    const nextPost = remainingPosts[0];
                    const showOthersSection = showFullRich && remainingPosts.length > 0;
                    const showFullOthersLinks = fullOthersListForPostIds.has(p.id);
                    const isLiked = likedPosts.has(p.id);

                    return (
                      <AnimatedSection key={p.id} delay={i * 0.1}>
                        <div
                          id={`college-post-${p.id}`}
                          className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow scroll-mt-24"
                        >
                          {p.image_url && (
                            <div className="w-full bg-muted/40 border-b border-border overflow-hidden">
                              <img
                                src={p.image_url}
                                alt={p.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-auto block align-middle"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <h3 className="font-bold text-foreground text-xl mb-2">{p.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground">
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">Collège</span>
                              <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-3 h-3" />
                                {format(new Date(p.created_at), "d MMM yyyy", { locale: fr })}
                              </span>
                              {p.author && <span>Par {p.author}</span>}
                            </div>
                            {showFullRich && p.content ? (
                              <RichContent content={p.content} className="text-sm" />
                            ) : (
                              <p className="text-muted-foreground text-sm leading-relaxed text-left">
                                {previewPlainMd(p.content || "", MAX_CHARS)}
                              </p>
                            )}
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex flex-wrap items-center gap-2">
                                {isLong && (
                                  <Button
                                    size="sm"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold uppercase tracking-wide text-xs w-fit"
                                    onClick={() => toggleExpand(p.id)}
                                  >
                                    {isExpanded ? "Voir moins" : "Lire plus"}
                                  </Button>
                                )}
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                  <EyeIcon className="w-3.5 h-3.5" /> {p.views_count ?? 0}
                                </span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isLiked ? "secondary" : "outline"}
                                  disabled={isLiked || incLikes.isPending}
                                  onClick={() => {
                                    incLikes.mutate(p.id, {
                                      onSuccess: () => {
                                        localStorage.setItem(`college-liked-${p.id}`, "1");
                                        setLikedPosts((prev) => new Set(prev).add(p.id));
                                      },
                                    });
                                  }}
                                >
                                  <HeartIcon className={`w-3.5 h-3.5 mr-1 ${isLiked ? "fill-current" : ""}`} />
                                  {p.likes_count ?? 0}
                                </Button>
                              </div>
                              <SocialShareButtons
                                title={`${p.title} — UPG Collège des étudiants`}
                                url={`${window.location.origin}/college-etudiants?post=${encodeURIComponent(p.id)}`}
                                className={isLong ? "" : "sm:ml-auto"}
                              />
                            </div>
                            {showOthersSection ? (
                              <div className="mt-6 space-y-4 rounded-lg border border-border bg-muted/30 px-4 py-4">
                                {!showFullOthersLinks && nextPost ? (
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                      Publication suivante
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        goToCollegePost(nextPost.id, {
                                          collapseId: p.id,
                                          unlockFullOthersListOnTarget: true,
                                        })
                                      }
                                      className="text-left text-base font-semibold text-primary underline underline-offset-4 hover:text-primary/90"
                                    >
                                      {nextPost.title}
                                    </button>
                                  </div>
                                ) : null}
                                {showFullOthersLinks ? (
                                  <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                      Autres publications
                                    </p>
                                    <ul className="space-y-2">
                                      {remainingPosts.map((other, j) => (
                                        <li key={other.id}>
                                          <button
                                            type="button"
                                            onClick={() => goToCollegePost(other.id, { collapseId: p.id })}
                                            className="text-left text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/90"
                                          >
                                            {j + 1}. {other.title}
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </AnimatedSection>
                    );
                  })}
                </div>
              ) : (
                <AnimatedSection delay={0.3}>
                  <div className="bg-upg-sky-light border border-primary/20 rounded-lg p-8 text-center">
                    <h3 className="font-bold text-foreground text-lg mb-2">
                      Espace du Comité Estudiantin
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Les publications et informations du comité estudiantin seront bientôt disponibles ici.
                    </p>
                  </div>
                </AnimatedSection>
              )}
            </div>

            {/* Sidebar - Articles Récents */}
            <aside className="w-full lg:w-72 shrink-0">
              <AnimatedSection delay={0.2}>
                <div className="border-l-4 border-primary pl-4 mb-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Articles Récents</h3>
                </div>
                <div className="divide-y divide-border">
                  {articles && articles.length > 0 ? (
                    articles.slice(0, 5).map((a) => (
                      <Link                         key={a.id}
                        to={`/blog?article=${a.id}`}
                        className="flex items-start gap-2 py-3 group hover:bg-accent/50 px-2 -mx-2 rounded transition-colors"
                      >
                        <ChevronRightIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                          {a.title}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm py-3">Aucun article pour le moment.</p>
                  )}
                </div>
                <div className="mt-4">
                  <Link to="/blog">
                    <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary/5">
                      Voir tous les articles
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CollegeEtudiantsPage;
