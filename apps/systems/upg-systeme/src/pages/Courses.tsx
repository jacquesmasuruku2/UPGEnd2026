import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DOMAINS, PROMOTIONS } from '@/data/domains';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, FileText, Upload, Download } from 'lucide-react';

interface CourseRow {
  id: string;
  code: string;
  nom: string;
  credits: number;
  enseignant_nom: string | null;
  filiere: string;
  filieres: string[];
  promotion: string;
  document_url: string | null;
  created_at: string | null;
}

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: '', nom: '', credits: '3', enseignant_nom: '', promotion: '', domaine: '',
    selectedFilieres: [] as string[], isTroncCommun: false
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const isAdmin = user?.role === 'super_admin';
  const isEnseignant = user?.role === 'enseignant';

  const load = async () => {
    const { data } = await supabase.from('courses').select('*').order('code');
    setCourses((data as any[] || []).map(c => ({ ...c, filieres: c.filieres || [] })));
  };

  useEffect(() => { load(); }, []);

  const allFilieres = DOMAINS.flatMap(d => d.filieres.map(f => ({ domaine: d.nom, filiere: f })));
  const selectedDomain = DOMAINS.find(d => d.nom === form.domaine);

  const handleToggleFiliere = (filiere: string) => {
    setForm(f => ({
      ...f,
      selectedFilieres: f.selectedFilieres.includes(filiere)
        ? f.selectedFilieres.filter(x => x !== filiere)
        : [...f.selectedFilieres, filiere]
    }));
  };

  const handleTroncCommun = (checked: boolean) => {
    if (checked) {
      setForm(f => ({ ...f, isTroncCommun: true, selectedFilieres: allFilieres.map(x => x.filiere), domaine: '' }));
    } else {
      setForm(f => ({ ...f, isTroncCommun: false, selectedFilieres: [] }));
    }
  };

  const handleAdd = async () => {
    if (!form.code || !form.nom || form.selectedFilieres.length === 0 || !form.promotion) {
      toast.error('Veuillez remplir les champs obligatoires et sélectionner au moins une filière');
      return;
    }

    setUploading(true);
    let documentUrl: string | null = null;

    if (docFile) {
      const ext = docFile.name.split('.').pop();
      const path = `${form.code}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('course-documents').upload(path, docFile);
      if (upErr) { toast.error('Erreur upload: ' + upErr.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('course-documents').getPublicUrl(path);
      documentUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('courses').insert({
      code: form.code, nom: form.nom, credits: parseInt(form.credits),
      enseignant_nom: form.enseignant_nom || null,
      filiere: form.selectedFilieres[0],
      filieres: form.selectedFilieres,
      promotion: form.promotion,
      document_url: documentUrl
    } as any);

    if (error) { toast.error(error.message); setUploading(false); return; }
    toast.success('Cours ajouté');
    setForm({ code: '', nom: '', credits: '3', enseignant_nom: '', promotion: '', domaine: '', selectedFilieres: [], isTroncCommun: false });
    setDocFile(null);
    setOpen(false);
    setUploading(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce cours?')) return;
    await supabase.from('courses').delete().eq('id', id);
    toast.success('Cours supprimé');
    load();
  };

  const handleUploadDoc = async (courseId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const path = `${courseId}-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from('course-documents').upload(path, file);
      if (upErr) { toast.error(upErr.message); return; }
      const { data: urlData } = supabase.storage.from('course-documents').getPublicUrl(path);
      await supabase.from('courses').update({ document_url: urlData.publicUrl } as any).eq('id', courseId);
      toast.success('Document uploadé');
      load();
    };
    input.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Gestion des Cours</h2>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Ajouter un cours</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nouveau Cours</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="INF101" /></div>
                <div><Label>Nom du cours *</Label><Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} /></div>
                <div><Label>Crédits</Label><Input type="number" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} /></div>
                <div><Label>Enseignant</Label><Input value={form.enseignant_nom} onChange={e => setForm(f => ({ ...f, enseignant_nom: e.target.value }))} /></div>
                <div>
                  <Label>Promotion *</Label>
                  <Select value={form.promotion} onValueChange={v => setForm(f => ({ ...f, promotion: v }))}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>{PROMOTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="border rounded-md p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="tronc" checked={form.isTroncCommun} onCheckedChange={(c) => handleTroncCommun(c as boolean)} />
                    <Label htmlFor="tronc" className="font-medium">Tronc commun (toutes les filières)</Label>
                  </div>

                  {!form.isTroncCommun && (
                    <>
                      <div>
                        <Label>Filtrer par domaine</Label>
                        <Select value={form.domaine} onValueChange={v => setForm(f => ({ ...f, domaine: v }))}>
                          <SelectTrigger><SelectValue placeholder="Tous les domaines" /></SelectTrigger>
                          <SelectContent>
                            {DOMAINS.map(d => <SelectItem key={d.nom} value={d.nom}>{d.nom}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        <Label className="text-xs text-muted-foreground">Sélectionner les filières *</Label>
                        {(selectedDomain ? selectedDomain.filieres.map(f => ({ domaine: selectedDomain.nom, filiere: f })) : allFilieres).map(item => (
                          <div key={item.filiere} className="flex items-center gap-2">
                            <Checkbox
                              id={item.filiere}
                              checked={form.selectedFilieres.includes(item.filiere)}
                              onCheckedChange={() => handleToggleFiliere(item.filiere)}
                            />
                            <Label htmlFor={item.filiere} className="text-sm font-normal">{item.filiere}</Label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {form.selectedFilieres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {form.selectedFilieres.map(f => (
                        <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Support de cours (PDF)</Label>
                  <Input type="file" accept=".pdf" onChange={e => setDocFile(e.target.files?.[0] || null)} />
                </div>

                <Button onClick={handleAdd} disabled={uploading}>
                  {uploading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Enseignant</TableHead>
                <TableHead>Filière(s)</TableHead>
                <TableHead>Promotion</TableHead>
                <TableHead>Support</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell className="font-medium">{c.nom}</TableCell>
                  <TableCell>{c.credits}</TableCell>
                  <TableCell>{c.enseignant_nom || '—'}</TableCell>
                  <TableCell className="text-sm max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const filieres = c.filieres?.length > 0 ? c.filieres : [c.filiere];
                        const allFilieresList = DOMAINS.flatMap(d => d.filieres);
                        const isTroncCommun = allFilieresList.every(f => filieres.includes(f));
                        if (isTroncCommun && filieres.length > 1) {
                          return <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">Tronc Commun</Badge>;
                        }
                        return filieres.map(f => (
                          <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                        ));
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>{c.promotion}</TableCell>
                  <TableCell>
                    {c.document_url ? (
                      <a href={c.document_url} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" title="Télécharger le support">
                          <Download className="h-4 w-4 text-primary" />
                        </Button>
                      </a>
                    ) : (isAdmin || isEnseignant) ? (
                      <Button size="icon" variant="ghost" onClick={() => handleUploadDoc(c.id)} title="Uploader un support PDF">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    {isAdmin && (
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Aucun cours</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
