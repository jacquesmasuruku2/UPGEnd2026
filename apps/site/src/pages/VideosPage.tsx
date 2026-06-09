import { Film, PlayCircle } from "lucide-react";
import { useRef, useState } from "react";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { useIncrementVideoViews, useVideos } from "@/hooks/useSupabaseData";

const VideosPage = () => {
  const { data: videos, isLoading } = useVideos(true);
  const incrementViews = useIncrementVideoViews();
  const [countedIds, setCountedIds] = useState<Record<string, boolean>>({});
  const [localViewsBoost, setLocalViewsBoost] = useState<Record<string, number>>({});
  const watchedSecondsRef = useRef<Record<string, number>>({});
  const lastTimeRef = useRef<Record<string, number>>({});

  const markView = (videoId: string) => {
    if (countedIds[videoId]) return;
    setCountedIds((prev) => ({ ...prev, [videoId]: true }));
    setLocalViewsBoost((prev) => ({ ...prev, [videoId]: 1 }));
    incrementViews.mutate(videoId);
  };

  const handleVideoTimeUpdate = (videoId: string, currentTime: number) => {
    if (countedIds[videoId]) return;

    const previous = lastTimeRef.current[videoId] ?? currentTime;
    const delta = currentTime - previous;
    lastTimeRef.current[videoId] = currentTime;

    // Ignore les sauts (seek) pour compter uniquement du temps de lecture réel.
    if (delta <= 0 || delta > 1.2) return;

    const total = (watchedSecondsRef.current[videoId] ?? 0) + delta;
    watchedSecondsRef.current[videoId] = total;

    if (total >= 3) {
      markView(videoId);
    }
  };

  const getSourceLabel = (url?: string | null) => {
    if (!url) return null;
    const lowered = url.toLowerCase();
    if (lowered.includes("facebook.com") || lowered.includes("fb.watch")) return "Facebook";
    if (lowered.includes("youtube.com") || lowered.includes("youtu.be")) return "YouTube";
    return "la source";
  };

  return (
    <Layout>
      <section className="bg-gradient-to-b from-background via-background to-muted/30 py-14 sm:py-20">
        <div className="mx-auto w-full max-w-[min(100%,1200px)] px-3 sm:px-4 lg:px-6">
          <AnimatedSection>
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
              <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Nos Vidéos
              </h1>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            {isLoading ? (
              <div className="rounded-2xl border border-border/70 bg-card py-16 text-center text-muted-foreground">
                Chargement des vidéos...
              </div>
            ) : videos && videos.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {videos.map((video) => (
                  <article
                    key={video.id}
                    className="overflow-hidden border border-border bg-card shadow-sm"
                  >
                    <div className="relative aspect-video w-full bg-black">
                      <video
                        src={video.video_url}
                        poster={video.poster_url || undefined}
                        className="h-full w-full"
                        controls
                        preload="metadata"
                        onTimeUpdate={(e) => handleVideoTimeUpdate(video.id, e.currentTarget.currentTime)}
                      />
                    </div>
                    <div className="space-y-1.5 p-3">
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                        Vidéo locale
                      </p>
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-sm font-semibold text-foreground">{video.title}</h2>
                        {video.source_url ? (
                          <a
                            href={video.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-[11px] font-medium text-primary underline-offset-2 hover:underline"
                          >
                            Voir la vidéo sur {getSourceLabel(video.source_url)}
                          </a>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vues: {(video.views_count ?? 0) + (localViewsBoost[video.id] ?? 0)}
                      </p>
                      {video.description ? (
                        <p className="text-xs leading-relaxed text-muted-foreground">{video.description}</p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-20 text-center">
                <Film className="mx-auto mb-4 h-16 w-16 text-muted-foreground/35" aria-hidden />
                <p className="mx-auto max-w-md leading-relaxed text-muted-foreground">
                  Aucune vidéo publiée pour le moment.
                </p>
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default VideosPage;
