import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Download, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  deadline: string;
  created_by: string;
  created_at: string;
  course_code?: string;
  course_nom?: string;
  submissions_count?: number;
}

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', description: '', deadline: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submissions, setSubmissions] = useState<Record<string, any[]>>({});
  const [viewSubs, setViewSubs] = useState<string | null>(null);

  const load = async () => {
    // Load courses for this teacher
    const { data: coursesData } = await supabase.from('courses').select('*').order('code');
    setCourses(coursesData || []);

    // Load assignments
    const { data: assignData } = await supabase.from('assignments').select('*').order('deadline', { ascending: false });
    
    if (assignData) {
      const courseIds = [...new Set(assignData.map((a: any) => a.course_id))];
      const courseMap: Record<string, any> = {};
      (coursesData || []).forEach((c: any) => { courseMap[c.id] = c; });

      // Load submission counts
      const { data: subs } = await supabase.from('assignment_submissions').select('assignment_id');
      const subCounts: Record<string, number> = {};
      (subs || []).forEach((s: any) => {
        subCounts[s.assignment_id] = (subCounts[s.assignment_id] || 0) + 1;
      });

      setAssignments(assignData.map((a: any) => ({
        ...a,
        course_code: courseMap[a.course_id]?.code,
        course_nom: courseMap[a.course_id]?.nom,
        submissions_count: subCounts[a.id] || 0
      })));
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.course_id || !form.title || !form.deadline) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setUploading(true);
    let fileUrl: string | null = null;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${form.course_id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('assignment-files').upload(path, file);
      if (upErr) { toast.error(upErr.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('assignment-files').getPublicUrl(path);
      fileUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('assignments').insert({
      course_id: form.course_id,
      title: form.title,
      description: form.description || null,
      file_url: fileUrl,
      deadline: new Date(form.deadline).toISOString(),
      created_by: user!.id
    } as any);

    if (error) { toast.error(error.message); setUploading(false); return; }
    toast.success('Travail publié');
    setForm({ course_id: '', title: '', description: '', deadline: '' });
    setFile(null);
    setOpen(false);
    setUploading(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce travail?')) return;
    await supabase.from('assignments').delete().eq('id', id);
    toast.success('Travail supprimé');
    load();
  };

  const loadSubmissions = async (assignmentId: string) => {
    const { data } = await supabase.from('assignment_submissions').select('*').eq('assignment_id', assignmentId).order('submitted_at');
    if (data) {
      // Get student info
      const studentIds = [...new Set(data.map((s: any) => s.student_id))];
      if (studentIds.length > 0) {
        const { data: students } = await supabase.from('students').select('id, nom, postnom, prenom, matricule').in('id', studentIds);
        const studentMap: Record<string, any> = {};
        (students || []).forEach(s => { studentMap[s.id] = s; });
        setSubmissions(prev => ({
          ...prev,
          [assignmentId]: data.map((s: any) => ({
            ...s,
            student_name: studentMap[s.student_id] ? `${studentMap[s.student_id].nom} ${studentMap[s.student_id].postnom}` : 'Inconnu',
            student_matricule: studentMap[s.student_id]?.matricule
          }))
        }));
      } else {
        setSubmissions(prev => ({ ...prev, [assignmentId]: [] }));
      }
    }
    setViewSubs(assignmentId);
  };

  const isExpired = (deadline: string) => new Date(deadline) < new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Travaux Pratiques</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Publier un TP</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau Travail Pratique</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Cours *</Label>
                <Select value={form.course_id} onValueChange={v => setForm(f => ({ ...f, course_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner le cours" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Titre *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="TP1 - Recherche sur..." /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Instructions détaillées du travail..." rows={4} /></div>
              <div><Label>Date limite de remise *</Label><Input type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></div>
              <div><Label>Fichier joint (questionnaire, consignes...)</Label><Input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} /></div>
              <Button onClick={handleAdd} disabled={uploading}>{uploading ? 'Publication...' : 'Publier le TP'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cours</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Date limite</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Remises</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm">{a.course_code}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{a.title}</span>
                      {a.file_url && (
                        <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex">
                          <Download className="h-3.5 w-3.5 text-primary" />
                        </a>
                      )}
                    </div>
                    {a.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(a.deadline), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isExpired(a.deadline) ? 'destructive' : 'default'}>
                      {isExpired(a.deadline) ? 'Expiré' : 'En cours'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => loadSubmissions(a.id)}>
                      <Users className="h-3.5 w-3.5 mr-1" /> {a.submissions_count}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {assignments.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucun travail publié</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Submissions viewer */}
      <Dialog open={!!viewSubs} onOpenChange={() => setViewSubs(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Travaux remis</DialogTitle></DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Étudiant</TableHead>
                <TableHead>Date de remise</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Fichier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(submissions[viewSubs!] || []).map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.student_matricule || '—'}</TableCell>
                  <TableCell>{s.student_name}</TableCell>
                  <TableCell className="text-sm">{format(new Date(s.submitted_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{s.description || '—'}</TableCell>
                  <TableCell>
                    {s.file_url ? (
                      <a href={s.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost"><Download className="h-4 w-4 text-primary" /></Button>
                      </a>
                    ) : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {(submissions[viewSubs!] || []).length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">Aucune remise</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
