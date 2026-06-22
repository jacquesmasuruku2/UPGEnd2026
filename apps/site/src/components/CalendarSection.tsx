import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useCalendarEvents } from "@/hooks/useSupabaseData";
import { format, isFuture, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import AnimatedSection from "./AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CalendarSection = () => {
  const { data: events, isLoading } = useCalendarEvents();
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    end_date: string | null;
    category: string | null;
  } | null>(null);

  const now = new Date();
  const isUpcomingEvent = (eventDate: string, endDate: string | null) => {
    const start = new Date(eventDate);
    const end = endDate ? new Date(endDate) : start;
    return isFuture(start) || isToday(start) || end >= now;
  };

  const upcomingEvents =
    events?.filter((e) => isUpcomingEvent(e.event_date, e.end_date)).slice(0, 6) ?? [];
  const pastEvents =
    events
      ?.filter((e) => !isUpcomingEvent(e.event_date, e.end_date))
      .sort((a, b) => +new Date(b.event_date) - +new Date(a.event_date))
      .slice(0, 8) ?? [];

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse h-8 w-48 bg-muted rounded mx-auto mb-4" />
            <div className="animate-pulse h-4 w-64 bg-muted rounded mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (!upcomingEvents.length && !pastEvents.length) {
    return null; // Don't render section if no upcoming events
  }

  return (
    <section id="calendrier" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-10">
            <span className="inline-block text-[hsl(var(--upg-orange))] text-sm font-semibold tracking-wider uppercase mb-2">
              Agenda
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Agenda public</h2>
            <div className="w-16 h-1 bg-[hsl(var(--upg-orange))] mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Restez informé des prochains événements académiques, culturels et administratifs de l'UPG.
            </p>
          </div>
        </AnimatedSection>

        {upcomingEvents.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
              À venir
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((event, i) => {
                const eventDate = new Date(event.event_date);
                const endDate = event.end_date ? new Date(event.end_date) : null;
                const isMultiDay = endDate && event.end_date !== event.event_date;

                return (
                  <AnimatedSection key={event.id} delay={i * 0.1}>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-left bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
                    >
                      <div className="flex gap-4">
                        <div className="shrink-0 w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary">
                          <span className="text-2xl font-bold leading-none">
                            {format(eventDate, "d", { locale: fr })}
                          </span>
                          <span className="text-xs uppercase font-medium">
                            {format(eventDate, "MMM", { locale: fr })}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">
                              {event.title}
                            </h3>
                            {event.category && (
                              <BadgeIcon variant="secondary" className="shrink-0 text-xs">
                                {event.category}
                              </BadgeIcon>
                            )}
                          </div>

                          {event.description && (
                            <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
                              {event.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                            <span>
                              {isMultiDay
                                ? `${format(eventDate, "d MMM", { locale: fr })} - ${format(endDate, "d MMM yyyy", { locale: fr })}`
                                : format(eventDate, "EEEE d MMMM yyyy", { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Événements passés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastEvents.map((event, i) => {
                const eventDate = new Date(event.event_date);
                const endDate = event.end_date ? new Date(event.end_date) : null;
                const isMultiDay = endDate && event.end_date !== event.event_date;

                return (
                  <AnimatedSection key={event.id} delay={i * 0.08}>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-left bg-card/70 border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/20 transition-all duration-300 group opacity-95"
                    >
                      <div className="flex gap-4">
                        <div className="shrink-0 w-16 h-16 rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground">
                          <span className="text-2xl font-bold leading-none">
                            {format(eventDate, "d", { locale: fr })}
                          </span>
                          <span className="text-xs uppercase font-medium">
                            {format(eventDate, "MMM", { locale: fr })}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2">
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                              <BadgeIcon variant="outline" className="text-[10px] uppercase tracking-wide">
                                Passé
                              </BadgeIcon>
                              {event.category && (
                                <BadgeIcon variant="secondary" className="text-xs">
                                  {event.category}
                                </BadgeIcon>
                              )}
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
                              {event.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                            <span>
                              {isMultiDay
                                ? `${format(eventDate, "d MMM", { locale: fr })} - ${format(endDate, "d MMM yyyy", { locale: fr })}`
                                : format(eventDate, "EEEE d MMMM yyyy", { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        )}

        <AnimatedSection>
          <div className="mt-10 text-center">
            <a href="/systeme-academique/index.html?start=/outils" target="_top" rel="noopener noreferrer">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Vérification de l&apos;étudiant
              </Button>
            </a>
          </div>
        </AnimatedSection>

        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="max-w-xl">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <DialogTitle className="pr-8">{selectedEvent.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>
                      {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.event_date
                        ? `${format(new Date(selectedEvent.event_date), "d MMM yyyy", { locale: fr })} - ${format(new Date(selectedEvent.end_date), "d MMM yyyy", { locale: fr })}`
                        : format(new Date(selectedEvent.event_date), "EEEE d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  {selectedEvent.category && (
                    <BadgeIcon variant="secondary">{selectedEvent.category}</BadgeIcon>
                  )}
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {selectedEvent.description?.trim() || "Aucun détail supplémentaire."}
                  </p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default CalendarSection;