import Layout from "@/components/Layout";
import { useLibraryBooks } from "@/hooks/useSupabaseData";
import AnimatedSection from "@/components/AnimatedSection";
import { BookOpen, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const LibraryPage = () => {
  const { data: books } = useLibraryBooks(true);
  const [search, setSearch] = useState("");

  const filtered = (books || []).filter(
    (b: any) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h1 className="text-3xl font-bold text-primary mb-2 text-center">
              Bibliothèque Numérique
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Accédez aux ressources académiques de l'UPG
            </p>
          </AnimatedSection>

          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un livre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {books && books.length === 0
                  ? "La bibliothèque sera bientôt disponible."
                  : "Aucun résultat trouvé."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {filtered.map((book: any) => (
                <AnimatedSection key={book.id}>
                  <div className="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow group">
                    {book.cover_url ? (
                      <div className="w-full h-56 bg-muted/40 p-2 flex items-center justify-center">
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-56 bg-secondary flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      {book.author && (
                        <p className="text-muted-foreground text-xs mb-1">{book.author}</p>
                      )}
                      {book.category && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {book.category}
                        </span>
                      )}
                      {book.description && (
                        <p className="text-muted-foreground text-xs mt-2 line-clamp-2">
                          {book.description}
                        </p>
                      )}
                      {book.pdf_url && (
                        <a href={book.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3 gap-2 border-primary text-primary hover:bg-primary/5"
                          >
                            <Download className="w-4 h-4" />
                            Télécharger PDF
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default LibraryPage;
