import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Download, Upload, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AssignmentView {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  deadline: string;
  course_code: string;
  course_nom: string;
  submitted: boolean;
  submission?: any;
}

export default function StudentAssignments() {
  const { user } = useAuth();
  const student = user?.studentData;
  const [assignments, setAssignments] = useState<AssignmentView[]>([]);
  const [submitDialog, setSubmitDialog] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!student) return;

    // Get courses for this student's filière and promotion
    const { data: coursesData } = await supabase.from('courses').select('*')
      .eq('promotion', student.promotion);

    // Filter courses that match this student's filière
    const myCourses = (coursesData || []).filter((c: any) => {
      const filieres: string[] = c.filieres || [];
      return filieres.includes(student.filiere) || c.filiere === student.filiere;
    });

    if (myCourses.length === 0) { setAssignments([]); return; }

    const courseIds = myCourses.map(c => c.id);
    const courseMap: Record<string, any> = {};
    myCourses.forEach(c => { courseMap[c.id] = c; });

    // Get assignments for these courses
    const { data: assignData } = await supabase.from('assignments').select('*')
      .in('course_id', courseIds).order('deadline', { ascending: false });

    if (!assignData || assignData.length === 0) { setAssignments([]); return; }

    // Get my submissions
    const assignIds = assignData.map((a: any) => a.id);
    const { data: mySubs } = await supabase.from('assignment_submissions').select('*')
      .eq('student_id', student.id).in('assignment_id', assignIds);

    const subMap: Record<string, any> = {};
    (mySubs || []).forEach((s: any) => { subMap[s.assignment_id] = s; });

    setAssignments(assignData.map((a: any) => ({
      ...a,
      course_code: courseMap[a.course_id]?.code || '',
      course_nom: courseMap[a.course_id]?.nom || '',
      submitted: !!subMap[a.id],
      submission: subMap[a.id] || null
    })));
  };

  useEffect(() => { load(); }, [student]);

  const isExpired = (deadline: string) => new Date(deadline) < new Date();

  const handleSubmit = async (assignmentId: string) => {
    if (!student) return;
    setUploading(true);
    let fileUrl: string | null = null;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${student.id}/${assignmentId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('submission-files').upload(path, file);
      if (upErr) { toast.error(upErr.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('submission-files').getPublicUrl(path);
      fileUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('assignment_submissions').insert({
      assignment_id: assignmentId,
      student_id: student.id,
      description: description || null,
      file_url: fileUrl
    } as any);

    if (error) {
      if (error.message.includes('duplicate')) {
        toast.error('Vous avez déjà remis ce travail');
      } else {
        toast.error(error.message);
      }
      setUploading(false);
      return;
    }

    toast.success('Travail remis avec succès !');
    setDescription('');
    setFile(null);
    setSubmitDialog(null);
    setUploading(false);
    load();
  };

  if (!student) {
    return <div className="text-center py-12 text-muted-foreground">Données étudiant non disponibles.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Mes Travaux</h2>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun travail disponible pour le moment
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map(a => {
            const expired = isExpired(a.deadline);
            return (
              <Card key={a.id} className={expired && !a.submitted ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{a.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">{a.course_code} — {a.course_nom}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.submitted ? (
                        <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Remis</Badge>
                      ) : expired ? (
                        <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Expiré</Badge>
                      ) : (
                        <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> En cours</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {a.description && <p className="text-sm mb-3">{a.description}</p>}
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Date limite: {format(new Date(a.deadline), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </span>
                    {a.file_url && (
                      <a href={a.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" /> Télécharger le questionnaire</Button>
                      </a>
                    )}
                    {!a.submitted && !expired && (
                      <Button size="sm" onClick={() => { setSubmitDialog(a.id); setDescription(''); setFile(null); }}>
                        <Upload className="h-3.5 w-3.5 mr-1" /> Remettre le travail
                      </Button>
                    )}
                  </div>
                  {a.submitted && a.submission && (
                    <div className="mt-3 p-2 rounded bg-secondary text-sm">
                      <p className="text-muted-foreground">Remis le {format(new Date(a.submission.submitted_at), 'dd/MM/yyyy à HH:mm')}</p>
                      {a.submission.description && <p className="mt-1">{a.submission.description}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!submitDialog} onOpenChange={() => setSubmitDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remettre le travail</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Description / commentaire</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description de votre travail..." rows={3} /></div>
            <div><Label>Fichier (PDF recommandé)</Label><Input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} /></div>
            <Button onClick={() => submitDialog && handleSubmit(submitDialog)} disabled={uploading}>
              {uploading ? 'Envoi en cours...' : 'Envoyer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
