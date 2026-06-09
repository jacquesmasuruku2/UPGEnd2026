import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { StudentRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<(StudentRequest & { student_name?: string })[]>([]);
  const [selected, setSelected] = useState<StudentRequest | null>(null);
  const [responseText, setResponseText] = useState('');

  // For student: new request form
  const [newReq, setNewReq] = useState({ type: 'recours', sujet: '', message: '' });

  const load = async () => {
    const { data } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
    if (data) {
      // Get student names
      const studentIds = [...new Set(data.map((r: any) => r.student_id))];
      const { data: students } = await supabase.from('students').select('id, nom, postnom').in('id', studentIds);
      const nameMap: Record<string, string> = {};
      students?.forEach((s: any) => { nameMap[s.id] = `${s.nom} ${s.postnom}`; });
      setRequests(data.map((r: any) => ({ ...r, student_name: nameMap[r.student_id] || 'Inconnu' })));
    }
  };

  useEffect(() => { load(); }, []);

  const submitRequest = async () => {
    if (!user?.studentData) { toast.error("Vous devez être connecté en tant qu'étudiant"); return; }
    const { error } = await supabase.from('requests').insert({
      student_id: user.studentData.id, type: newReq.type, sujet: newReq.sujet, message: newReq.message
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success('Requête soumise');
    setNewReq({ type: 'recours', sujet: '', message: '' });
    load();
  };

  const respond = async () => {
    if (!selected) return;
    await supabase.from('requests').update({ status: 'responded', response: responseText, responded_by: user?.id } as any).eq('id', selected.id);
    toast.success('Réponse envoyée');
    setSelected(null);
    setResponseText('');
    load();
  };

  const isStaff = user?.role !== 'etudiant';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Requêtes & Réclamations</h2>

      {user?.role === 'etudiant' && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">Nouvelle requête</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select value={newReq.type} onValueChange={v => setNewReq(r => ({ ...r, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recours">Recours (contestation de note)</SelectItem>
                  <SelectItem value="communication">Communication officielle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Sujet</Label><Input value={newReq.sujet} onChange={e => setNewReq(r => ({ ...r, sujet: e.target.value }))} /></div>
            <div><Label>Message</Label><Textarea value={newReq.message} onChange={e => setNewReq(r => ({ ...r, message: e.target.value }))} rows={4} /></div>
            <Button onClick={submitRequest}>Soumettre</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6 space-y-3">
          {requests.map(r => (
            <div key={r.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={r.type === 'recours' ? 'destructive' : 'secondary'}>{r.type}</Badge>
                    <Badge variant={r.status === 'responded' ? 'default' : 'outline'}>
                      {r.status === 'responded' ? 'Répondu' : 'En attente'}
                    </Badge>
                  </div>
                  <h4 className="font-semibold">{r.sujet}</h4>
                  {isStaff && <p className="text-sm text-muted-foreground">Par: {r.student_name}</p>}
                  <p className="text-sm mt-1">{r.message}</p>
                  {r.response && (
                    <div className="mt-2 p-2 bg-secondary rounded text-sm">
                      <strong>Réponse:</strong> {r.response}
                    </div>
                  )}
                </div>
                {isStaff && r.status === 'pending' && (
                  <Button size="sm" variant="outline" onClick={() => { setSelected(r); setResponseText(''); }}>
                    <MessageSquare className="h-4 w-4 mr-1" /> Répondre
                  </Button>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune requête</p>}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Répondre à la requête</DialogTitle></DialogHeader>
          <p className="text-sm mb-2"><strong>{selected?.sujet}</strong>: {selected?.message}</p>
          <Textarea value={responseText} onChange={e => setResponseText(e.target.value)} placeholder="Votre réponse..." rows={4} />
          <Button onClick={respond} className="mt-2">Envoyer la réponse</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
