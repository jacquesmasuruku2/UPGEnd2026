import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Announcement } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Bell, Check, X } from 'lucide-react';

export default function Valve() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<(Announcement & { isRead: boolean })[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ titre: '', contenu: '', image_url: '' });
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [viewAnn, setViewAnn] = useState<(Announcement & { isRead: boolean }) | null>(null);

  const load = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    let reads = new Set<string>();
    if (user) {
      const { data: readData } = await supabase.from('announcement_reads').select('announcement_id').eq('user_id', user.id);
      reads = new Set(readData?.map((r: any) => r.announcement_id) || []);
    }
    setReadIds(reads);
    setAnnouncements((data as Announcement[] || []).map(a => ({ ...a, isRead: reads.has(a.id) })));
  };

  useEffect(() => {
    load();
    const channel = supabase.channel('announcements').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, () => load()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const markAsRead = async (id: string) => {
    if (!user) return;
    await supabase.from('announcement_reads').insert({ announcement_id: id, user_id: user.id } as any);
    setReadIds(prev => new Set([...prev, id]));
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const publish = async () => {
    const { error } = await supabase.from('announcements').insert({
      titre: form.titre, contenu: form.contenu, auteur: user?.nom || '', created_by: user?.id,
      image_url: form.image_url || null
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success('Communiqué publié');
    setForm({ titre: '', contenu: '', image_url: '' });
    setOpen(false);
    load();
  };

  const isStaff = user?.role === 'super_admin' || user?.role === 'appariteur';
  const unreadCount = announcements.filter(a => !a.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Valve — Communiqués</h2>
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}</Badge>}
        </div>
        {isStaff && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Publier</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouveau communiqué</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Titre</Label><Input value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} /></div>
                <div><Label>URL de l'image (optionnel)</Label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." /></div>
                <div><Label>Contenu</Label><Textarea value={form.contenu} onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))} rows={5} /></div>
                <Button onClick={publish}>Publier</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {announcements.map(a => (
          <Card
            key={a.id}
            className={`cursor-pointer transition-shadow hover:shadow-md ${a.isRead ? 'opacity-75' : 'border-primary/30'}`}
            onClick={() => { setViewAnn(a); if (!a.isRead) markAsRead(a.id); }}
          >
            <CardContent className="pt-4">
              {a.image_url && (
                <img src={a.image_url} alt="" className="w-full h-40 object-cover rounded-md mb-3" />
              )}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {!a.isRead && <Bell className="h-4 w-4 text-destructive animate-pulse" />}
                    <h3 className="font-semibold">{a.titre}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Par {a.auteur} • {new Date(a.created_at).toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm mt-1 line-clamp-2">{a.contenu}</p>
                </div>
                {!a.isRead && (
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); markAsRead(a.id); }}>
                    <Check className="h-4 w-4 mr-1" /> Lu
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun communiqué</CardContent></Card>
        )}
      </div>

      {/* Full view dialog */}
      <Dialog open={!!viewAnn} onOpenChange={() => setViewAnn(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewAnn?.titre}</DialogTitle>
          </DialogHeader>
          {viewAnn?.image_url && (
            <img src={viewAnn.image_url} alt="" className="w-full rounded-md" />
          )}
          <p className="text-sm text-muted-foreground">Par {viewAnn?.auteur} • {viewAnn ? new Date(viewAnn.created_at).toLocaleDateString('fr-FR') : ''}</p>
          <p className="text-sm whitespace-pre-wrap">{viewAnn?.contenu}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
