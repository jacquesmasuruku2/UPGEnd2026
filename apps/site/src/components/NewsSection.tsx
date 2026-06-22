import { CalendarIcon, TagIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useBlogArticles } from "@/hooks/useSupabaseData";
import AnimatedSection from "./AnimatedSection";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

const NewsSection = () => {
  const { data: articles } = useBlogArticles(true);

  const displayArticles = articles && articles.length > 0 ? articles.slice(0, 4) : [];

  return (
    <section id="actualites" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">Dernières Nouvelles</h2>
          </div>
        </AnimatedSection>

        {displayArticles.length === 0 ? (
          <AnimatedSection delay={0.2}>
            <p className="text-center text-muted-foreground">Les actualités seront publiées prochainement.</p>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {displayArticles.map((article: any, i: number) => (
              <AnimatedSection key={article.id} delay={i * 0.1}>
                <div className="bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  {article.image_url && (
                    <div className="h-44 w-full bg-muted flex items-center justify-center overflow-hidden">
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {format(new Date(article.published_at || article.created_at), "d MMM yyyy", { locale: fr })}
                      </span>
                      {article.category && (
                        <span className="flex items-center gap-1 text-upg-orange">
                          <TagIcon className="w-3 h-3" />
                          {article.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 flex-1">
                      {article.excerpt || article.content?.slice(0, 150)}
                    </p>
                    <div className="mt-4">
                      <Link to={`/blog?article=${article.id}`}>
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5">
                          En savoir plus
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/blog">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Voir toutes les actualités
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
