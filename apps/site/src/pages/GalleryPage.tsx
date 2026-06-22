import Layout from "@/components/Layout";
import { useGallery } from "@/hooks/useSupabaseData";
import AnimatedSection from "@/components/AnimatedSection";
import GalleryViewer from "@/components/gallery/GalleryViewer";
import { Photo } from "@heroicons/react/24/outline";

const GalleryPage = () => {
  const { data: images, isLoading } = useGallery();

  return (
    <Layout>
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto w-full max-w-[min(100%,1140px)] px-3 sm:px-4 lg:px-6">
          <AnimatedSection>
            <div className="mb-10 max-w-3xl sm:mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">UPG</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Galerie</h1>
            </div>
          </AnimatedSection>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <div
                className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
                aria-hidden
              />
              <span className="text-sm">Chargement de la galerie…</span>
            </div>
          ) : images && images.length > 0 ? (
            <GalleryViewer items={images} />
          ) : (
            <AnimatedSection>
              <div className="text-center py-20 border border-dashed border-border/80 bg-muted/20">
                <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/35" aria-hidden />
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  La galerie sera bientôt disponible. Les photos seront ajoutées via le panneau
                  d&apos;administration.
                </p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default GalleryPage;
