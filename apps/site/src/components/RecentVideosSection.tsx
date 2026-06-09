import { PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useVideos } from "@/hooks/useSupabaseData";
import AnimatedSection from "./AnimatedSection";

const RecentVideosSection = () => {
  const { data: videos, isLoading } = useVideos(true);
  const recentVideos = videos?.slice(0, 3) ?? [];

  return (
    <section className="bg-secondary/40 py-16">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold text-primary sm:text-3xl">Vidéos récentes</h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              Découvrez les dernières vidéos publiées par l&apos;Université Polytechnique de Goma.
            </p>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <AnimatedSection delay={0.1}>
            <p className="text-center text-muted-foreground">Chargement des vidéos...</p>
          </AnimatedSection>
        ) : recentVideos.length === 0 ? (
          <AnimatedSection delay={0.1}>
            <p className="text-center text-muted-foreground">Aucune vidéo publiée pour le moment.</p>
          </AnimatedSection>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recentVideos.map((video, i) => (
              <AnimatedSection key={video.id} delay={i * 0.1}>
                <article className="overflow-hidden border border-border bg-card shadow-sm">
                  <div className="aspect-video w-full bg-black">
                    <video
                      src={video.video_url}
                      poster={video.poster_url || undefined}
                      className="h-full w-full"
                      controls
                      preload="metadata"
                    />
                  </div>
                  <div className="space-y-1.5 p-4">
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                      Vidéo publiée
                    </p>
                    <h3 className="line-clamp-2 text-base font-semibold text-foreground">{video.title}</h3>
                    <p className="text-xs text-muted-foreground">Vues: {video.views_count ?? 0}</p>
                    {video.description ? (
                      <p className="line-clamp-3 text-sm text-muted-foreground">{video.description}</p>
                    ) : null}
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        )}

        <AnimatedSection delay={0.2}>
          <div className="mt-8 text-center">
            <Link to="/videos">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Voir toutes les vidéos
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default RecentVideosSection;
