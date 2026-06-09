import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, Student, Grade } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Save, FileText, Send, Edit, CheckCircle, History } from 'lucide-react';
import TranscriptDocument from '@/components/TranscriptDocument';

interface GradeEntry {
  note: string;
  published: boolean;
  gradeId?: string;
  originalNote?: number | null;
  hasBeenModified?: boolean;
  history?: { previous_note: number; new_note: number; modified_at: string }[];
}

export default function Grades() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [transcriptStudent, setTranscriptStudent] = useState<Student | null>(null);
  const [transcriptGrades, setTranscriptGrades] = useState<any[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('courses').select('*').order('code').then(({ data }) => setCourses((data as Course[]) || []));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const course = courses.find(c => c.id === selectedCourse);
    if (!course) return;

    const loadData = async () => {
      const { data: studs } = await supabase.from('students').select('*')
        .eq('filiere', course.filiere).eq('promotion', course.promotion).eq('status', 'approved');
      setStudents((studs as Student[]) || []);

      const { data: existingGrades } = await supabase.from('grades').select('*').eq('course_id', selectedCourse);
      
      // Load grade history
      const { data: historyData } = await supabase.from('grade_history' as any).select('*').eq('course_id', selectedCourse);
      const historyMap: Record<string, any[]> = {};
      (historyData as any[] || []).forEach((h: any) => {
        if (!historyMap[h.student_id]) historyMap[h.student_id] = [];
        historyMap[h.student_id].push(h);
      });

      const g: Record<string, GradeEntry> = {};
      let allPublished = true;
      (existingGrades as any[] || []).forEach(gr => {
        const studentHistory = historyMap[gr.student_id] || [];
        const effectiveNote = (gr.note && gr.note > 0) ? gr.note : (gr.total ?? 0);
        g[gr.student_id] = {
          note: String(effectiveNote),
          published: gr.published || false,
          gradeId: gr.id,
          originalNote: studentHistory.length > 0 ? studentHistory[0].previous_note : null,
          hasBeenModified: studentHistory.length > 0,
          history: studentHistory.sort((a: any, b: any) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime())
        };
        if (!gr.published) allPublished = false;
      });
      if ((existingGrades || []).length === 0) allPublished = false;
      setIsPublished(allPublished);
      setGrades(g);
      setEditingStudent(null);
    };
    loadData();
  }, [selectedCourse, courses]);

  const updateGrade = (studentId: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId] || { note: '0', published: false }, note: value }
    }));
  };

  const saveGrades = async () => {
    for (const [studentId, g] of Object.entries(grades)) {
      const noteVal = parseFloat(g.note) || 0;
      const payload = {
        student_id: studentId, course_id: selectedCourse,
        note: noteVal, total: noteVal,
        tp: 0, interro: 0, examen: 0,
        created_by: user?.id
      };
      await supabase.from('grades').upsert(payload as any, { onConflict: 'student_id,course_id' });
    }
    toast.success('Cotes enregistrées!');
  };

  const saveModifiedGrade = async (studentId: string) => {
    const g = grades[studentId];
    if (!g || !g.gradeId) return;
    
    const newNote = parseFloat(g.note) || 0;
    
    // Get current note from DB before updating
    const { data: currentGrade } = await supabase.from('grades').select('note').eq('id', g.gradeId).single();
    const previousNote = currentGrade?.note ?? 0;

    // Save history
    await supabase.from('grade_history' as any).insert({
      grade_id: g.gradeId,
      student_id: studentId,
      course_id: selectedCourse,
      previous_note: previousNote,
      new_note: newNote,
      modified_by: user?.id
    } as any);

    // Update grade
    await supabase.from('grades').update({ note: newNote, total: newNote } as any).eq('id', g.gradeId);
    
    toast.success('Cote modifiée avec traçabilité!');
    setEditingStudent(null);
    
    // Reload
    const course = courses.find(c => c.id === selectedCourse);
    if (course) {
      const { data: existingGrades } = await supabase.from('grades').select('*').eq('course_id', selectedCourse);
      const { data: historyDataReload } = await supabase.from('grade_history' as any).select('*').eq('course_id', selectedCourse);
      const historyMap: Record<string, any[]> = {};
      (historyDataReload as any[] || []).forEach((h: any) => {
        if (!historyMap[h.student_id]) historyMap[h.student_id] = [];
        historyMap[h.student_id].push(h);
      });
      const newGrades: Record<string, GradeEntry> = {};
      (existingGrades as any[] || []).forEach(gr => {
        const studentHistory = historyMap[gr.student_id] || [];
        const effectiveNote = (gr.note && gr.note > 0) ? gr.note : (gr.total ?? 0);
        newGrades[gr.student_id] = {
          note: String(effectiveNote),
          published: gr.published || false,
          gradeId: gr.id,
          originalNote: studentHistory.length > 0 ? studentHistory[0].previous_note : null,
          hasBeenModified: studentHistory.length > 0,
          history: studentHistory.sort((a: any, b: any) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime())
        };
      });
      setGrades(newGrades);
    }
  };

  const publishGrades = async () => {
    const { error } = await supabase.from('grades').update({ published: true } as any).eq('course_id', selectedCourse);
    if (error) { toast.error(error.message); return; }
    setIsPublished(true);
    setGrades(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => { updated[k] = { ...updated[k], published: true }; });
      return updated;
    });
    toast.success('Résultats publiés! Les étudiants peuvent maintenant voir leurs cotes.');
  };

  const openTranscript = async (student: Student) => {
    // Load ALL courses for this student's promotion and filiere
    const { data: allCourses } = await supabase.from('courses').select('id, code, nom, credits')
      .eq('promotion', student.promotion);
    
    // Filter courses that match student's filiere or are "tronc commun"
    const relevantCourses = (allCourses || []).filter((c: any) => 
      c.filiere === student.filiere || c.filiere === 'Tronc Commun'
    );

    // Also check courses with filieres array
    const { data: allCoursesWithFilieres } = await supabase.from('courses').select('id, code, nom, credits, filiere, filieres')
      .eq('promotion', student.promotion);
    
    const courseMap: Record<string, { code: string; nom: string; credits: number }> = {};
    (allCoursesWithFilieres || []).forEach((c: any) => {
      const matchesFiliere = c.filiere === student.filiere;
      const matchesFilieres = c.filieres && Array.isArray(c.filieres) && c.filieres.includes(student.filiere);
      if (matchesFiliere || matchesFilieres) {
        courseMap[c.id] = { code: c.code, nom: c.nom, credits: c.credits };
      }
    });

    // Load grades for this student
    const { data: grs } = await supabase.from('grades').select('*').eq('student_id', student.id);
    const gradeMap: Record<string, any> = {};
    (grs || []).forEach((g: any) => { gradeMap[g.course_id] = g; });

    // Build transcript: all courses in program, with grade if exists
    const transcriptData = Object.entries(courseMap).map(([courseId, course]) => {
      const grade = gradeMap[courseId];
      return {
        id: grade?.id || courseId,
        course_id: courseId,
        course_code: course.code,
        course_nom: course.nom,
        course_credits: course.credits,
        note: grade ? ((grade.note && grade.note > 0) ? grade.note : (grade.total ?? null)) : null,
      };
    });

    setTranscriptGrades(transcriptData);
    setTranscriptStudent(student);
  };

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Attribution des Cotes</h2>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <Label>Sélectionner un cours</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="max-w-md"><SelectValue placeholder="Choisir un cours" /></SelectTrigger>
            <SelectContent>
              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} — {c.nom} ({c.filiere} {c.promotion})</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCourse && students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Étudiants — {courses.find(c => c.id === selectedCourse)?.nom}</CardTitle>
              {isPublished && <Badge className="bg-green-600">Publié</Badge>}
            </div>
            <div className="flex gap-2">
              <Button onClick={saveGrades}><Save className="h-4 w-4 mr-1" /> Enregistrer</Button>
              {isSuperAdmin && !isPublished && (
                <Button variant="secondary" onClick={publishGrades}><Send className="h-4 w-4 mr-1" /> Publier les résultats</Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="w-28">Note (/20)</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(s => {
                    const g = grades[s.id] || { note: '0', published: false };
                    const isAlreadyGraded = !!g.gradeId;
                    const isEditing = editingStudent === s.id;

                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-sm">{s.matricule}</TableCell>
                        <TableCell>{s.nom} {s.postnom}</TableCell>
                        <TableCell>
                          <Input type="number" min="0" max="20" step="0.5" value={g.note}
                            onChange={e => updateGrade(s.id, e.target.value)}
                            className="h-8 w-20"
                            disabled={isAlreadyGraded && !isEditing}
                          />
                        </TableCell>
                        <TableCell>
                          {isAlreadyGraded ? (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" /> Coté
                              </Badge>
                              {g.hasBeenModified && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 cursor-help">
                                      <History className="h-3 w-3 mr-1" /> Modifié
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <div className="text-xs space-y-1">
                                      <div className="font-bold">Historique des modifications :</div>
                                      {g.history?.map((h, i) => (
                                        <div key={i}>
                                          {h.previous_note}/20 → {h.new_note}/20 — {new Date(h.modified_at).toLocaleDateString('fr-FR')}
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">Non coté</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {isAlreadyGraded && !isEditing && (
                              <Button size="sm" variant="outline" onClick={() => setEditingStudent(s.id)}>
                                <Edit className="h-3 w-3 mr-1" /> Modifier
                              </Button>
                            )}
                            {isEditing && (
                              <div className="flex gap-1">
                                <Button size="sm" onClick={() => saveModifiedGrade(s.id)}>
                                  <Save className="h-3 w-3 mr-1" /> Sauver
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingStudent(null)}>
                                  Annuler
                                </Button>
                              </div>
                            )}
                            {isSuperAdmin && (
                              <Button size="icon" variant="ghost" onClick={() => openTranscript(s)} title="Relevé de cotes">
                                <FileText className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </CardContent>
        </Card>
      )}

      {selectedCourse && students.length === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun étudiant approuvé dans cette filière/promotion</CardContent></Card>
      )}

      <Dialog open={!!transcriptStudent} onOpenChange={() => setTranscriptStudent(null)}>
        <DialogContent className="max-w-[660px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Relevé de Cotes</DialogTitle></DialogHeader>
          {transcriptStudent && <TranscriptDocument student={transcriptStudent} grades={transcriptGrades} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
