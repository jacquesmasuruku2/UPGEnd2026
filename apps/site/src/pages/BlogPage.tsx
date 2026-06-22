import Layout from "@/components/Layout";
import RichContent from "@/components/RichContent";
import SocialShareButtons from "@/components/SocialShareButtons";
import { CalendarIcon, TagIcon, UserIcon, ArrowLeftIcon, MagnifyingGlass, ChatBubbleLeft, EyeIcon, HeartIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBlogArticles, useIncrementBlogArticleLikes, useIncrementBlogArticleViews } from "@/hooks/useSupabaseData";
import { useComments, useAddComment } from "@/hooks/useSupabaseData";
import AnimatedSection from "@/components/AnimatedSection";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const staticArticles = [
  {
    id: "1",
    published_at: "2026-01-19",
    created_at: "2026-01-19",
    category: "Annonce",
    title: "Lancement d'un nouveau portail",
    excerpt: "L'Université Polytechnique de Goma franchit une étape majeure dans sa transformation digitale...",
    author: null,
    image_url: null,
    views_count: 0,
    likes_count: 0,
    content: "L'Université Polytechnique de Goma franchit une étape majeure dans sa transformation digitale. En mettant en ligne son nouveau site internet, l'institution se dote d'un outil stratégique pour répondre aux défis de la communication moderne.\n\nL'expertise interne à l'honneur — Le développement de cette plateforme a été confié au service informatique de l'UPG.\n\nUne plateforme au service de l'étudiant — Au-delà de l'aspect esthétique, le site a été pensé comme un véritable hub de services.",
  },
  {
    id: "2",
    published_at: "2026-01-10",
    created_at: "2026-01-10",
    category: "Académique",
    title: "Ouverture des inscriptions 2026",
    excerpt: "Les inscriptions pour l'année académique 2026 sont officiellement ouvertes.",
    author: null,
    image_url: null,
    views_count: 0,
    likes_count: 0,
    content: "Les inscriptions pour l'année académique 2026 sont officiellement ouvertes. Les étudiants sont invités à se présenter au secrétariat académique munis de leurs documents requis.\n\nLes facultés concernées incluent la Polytechnique, les Sciences Économiques, la Santé Publique, le Management, les Sciences de Développement, et les Sciences Agronomiques & Environnement.",
  },
];

const CommentSection = ({ articleId }: { articleId: string }) => {
  const { data: comments } = useComments(articleId);
  const addComment = useAddComment();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    addComment.mutate(
      {
        article_id: articleId,
        author_name: name.trim(),
        author_email: email.trim() || undefined,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setName("");
          setEmail("");
          setContent("");
        },
      }
    );
  };

  return (
    <div className="mt-8 border-t border-border pt-8">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <ChatBubbleLeftIcon className="w-5 h-5 text-primary" />
        Commentaires ({comments?.length || 0})
      </h3>

      <div className="space-y-4 mb-6">
        {(comments || []).map((c: any) => (
          <div key={c.id} className="bg-secondary border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {c.author_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{c.author_name}</p>
                <p className="text-muted-foreground text-xs">
                  {format(new Date(c.created_at), "d MMM yyyy à HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
            <p className="text-foreground text-sm">{c.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-foreground text-sm">Laisser un commentaire</h4>
        <Input placeholder="Votre nom *" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          type="email"
          placeholder="Votre email (facultatif)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Textarea placeholder="Votre commentaire *" value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
        <Button type="submit" size="sm" disabled={addComment.isPending}>
          {addComment.isPending ? "Envoi..." : "Commenter"}
        </Button>
      </form>
    </div>
  );
};

const BlogPage = () => {
  const { data: dbArticles } = useBlogArticles(true);
  const incViews = useIncrementBlogArticleViews();
  const incLikes = useIncrementBlogArticleLikes();
  const articles = dbArticles && dbArticles.length > 0 ? dbArticles : staticArticles;
  const [sortBy, setSortBy] = useState<"latest" | "most_read" | "most_liked">("latest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const viewedArticlesRef = useRef<Set<string>>(new Set());
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const articleParam = searchParams.get("article");
    if (articleParam) setSelectedId(articleParam);
  }, [searchParams]);

  useEffect(() => {
    const selectedArticleId = selectedId;
    if (!selectedArticleId || viewedArticlesRef.current.has(selectedArticleId)) return;
    viewedArticlesRef.current.add(selectedArticleId);
    incViews.mutate(selectedArticleId);
  }, [selectedId]);

  useEffect(() => {
    const next = new Set<string>();
    articles.forEach((a) => {
      if (localStorage.getItem(`blog-liked-${a.id}`) === "1") next.add(a.id);
    });
    setLikedArticles(next);
  }, [articles]);

  const selectedArticle = selectedId ? articles.find((a) => a.id === selectedId) : null;

  const filtered = articles
    .filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.category || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.excerpt || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "most_read") return (b.views_count ?? 0) - (a.views_count ?? 0);
      if (sortBy === "most_liked") return (b.likes_count ?? 0) - (a.likes_count ?? 0);
      return (
        new Date(b.published_at || b.created_at).getTime() -
        new Date(a.published_at || a.created_at).getTime()
      );
    });

  if (selectedArticle) {
    const articleUrl = `${window.location.origin}/blog?article=${selectedArticle.id}`;
    const isLiked = likedArticles.has(selectedArticle.id);

    return (
      <Layout>
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <Button variant="ghost" className="mb-6 text-primary" onClick={() => setSelectedId(null)}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" /> Retour aux articles
            </Button>
            <article className="bg-card border border-border overflow-hidden shadow-sm">
              {selectedArticle.image_url && (
                <div className="bg-muted/40 border-b border-border overflow-hidden">
                  <img
                    src={selectedArticle.image_url}
                    alt={selectedArticle.title}
                    loading="eager"
                    decoding="async"
                    className="w-full h-auto block align-middle"
                  />
                </div>
              )}
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {format(new Date(selectedArticle.published_at || selectedArticle.created_at), "d MMM yyyy", { locale: fr })}
                  </span>
                  {selectedArticle.category && (
                    <span className="flex items-center gap-1 text-upg-orange">
                      <TagIcon className="w-4 h-4" /> {selectedArticle.category}
                    </span>
                  )}
                  {selectedArticle.author && (
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" /> {selectedArticle.author}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">{selectedArticle.title}</h1>
                <RichContent
                  content={selectedArticle.content || selectedArticle.excerpt || ""}
                  className="max-w-none text-foreground"
                />

                <div className="mt-8 pt-6 border-t border-border">
                  <SocialShareButtons title={selectedArticle.title} url={articleUrl} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-muted-foreground">
                    <EyeIcon className="w-4 h-4" /> {selectedArticle.views_count ?? 0} vues
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant={isLiked ? "secondary" : "outline"}
                    disabled={isLiked || incLikes.isPending}
                    onClick={() => {
                      incLikes.mutate(selectedArticle.id, {
                        onSuccess: () => {
                          localStorage.setItem(`blog-liked-${selectedArticle.id}`, "1");
                          setLikedArticles((prev) => new Set(prev).add(selectedArticle.id));
                        },
                      });
                    }}
                  >
                    <HeartIcon className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                    {selectedArticle.likes_count ?? 0} j'aime
                  </Button>
                </div>

                <CommentSection articleId={selectedArticle.id} />
              </div>
            </article>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-14 sm:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-[1280px]">
          <AnimatedSection>
            <div className="mb-10 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                Nos Articles récents
              </h1>
              <p className="text-muted-foreground mt-2">Restez connecté pour suivre nos dernières actualités</p>
            </div>
          </AnimatedSection>

          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une actualité..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                value={sortBy}
                onValueChange={(value: "latest" | "most_read" | "most_liked") => setSortBy(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trier les articles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Plus récents</SelectItem>
                  <SelectItem value="most_read">Plus lus</SelectItem>
                  <SelectItem value="most_liked">Plus aimés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {filtered.map((a, i) => (
              <div key={a.id} className="h-full min-w-0">
                <AnimatedSection delay={Math.min(i * 0.06, 0.45)} className="h-full">
                  <article className="group h-full flex flex-col overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                    {a.image_url ? (
                      <button
                        type="button"
                        onClick={() => setSelectedId(a.id)}
                        className="relative block w-full shrink-0 aspect-[4/3] overflow-hidden bg-muted text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                        aria-label={`Lire : ${a.title}`}
                      >
                        <img
                          src={a.image_url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedId(a.id)}
                        className="flex aspect-[4/3] w-full shrink-0 items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground"
                      >
                        Pas d&apos;image
                      </button>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <h2 className="mb-2 text-sm font-semibold leading-snug text-foreground line-clamp-2">
                        {a.title}
                      </h2>
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                        {a.excerpt || `${(a.content || "").slice(0, 120)}…`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedId(a.id)}
                        className="self-start text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        Voir plus
                      </button>
                    </div>
                  </article>
                </AnimatedSection>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 rounded-md text-sm font-medium"
              onClick={() => setSelectedId(null)}
            >
              Voir tout
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;
