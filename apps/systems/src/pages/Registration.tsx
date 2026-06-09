import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOMAINS, PROMOTIONS } from '@/data/domains';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Upload, User, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoUpg from '@/assets/logo-upg.jpg';

const steps = [
  { label: 'Identité', icon: User },
  { label: 'Parcours Scolaire', icon: BookOpen },
  { label: 'Documents', icon: FileText },
];

export default function Registration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nom: '', postnom: '', prenom: '', sexe: '', date_naissance: '', lieu_naissance: '',
    nationalite: 'Congolaise', telephone: '', email: '', adresse: '',
    domaine: '', filiere: '', promotion: '', annee_academique: '2025-2026',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const selectedDomain = DOMAINS.find(d => d.nom === form.domaine);
  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La photo ne doit pas dépasser 5 Mo');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!photoFile) {
      toast.error('La photo passeport est obligatoire');
      return;
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Adresse email invalide');
      return;
    }

    setSubmitting(true);
    let photoUrl: string | null = null;

    const ext = photoFile.name.split('.').pop();
    const sanitizedEmail = form.email.replace(/[^a-zA-Z0-9@._-]/g, '');
    const path = `photos/${sanitizedEmail}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('course-documents').upload(path, photoFile);
    if (upErr) {
      toast.error('Erreur upload photo: ' + upErr.message);
      setSubmitting(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('course-documents').getPublicUrl(path);
    photoUrl = urlData.publicUrl;

    const { error } = await supabase.from('students').insert({
      nom: form.nom.trim(), postnom: form.postnom.trim(), prenom: form.prenom.trim(), sexe: form.sexe,
      date_naissance: form.date_naissance, lieu_naissance: form.lieu_naissance.trim(),
      nationalite: form.nationalite.trim(), telephone: form.telephone.trim(), email: form.email.trim(),
      adresse: form.adresse.trim(), domaine: form.domaine, filiere: form.filiere,
      promotion: form.promotion, annee_academique: form.annee_academique, status: 'pending',
      photo_url: photoUrl
    } as any);
    setSubmitting(false);
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success("Inscription soumise ! En attente d'approbation pour recevoir votre matricule.");
      navigate('/');
    }
  };

  const canProceed = () => {
    if (step === 0) return form.nom && form.postnom && form.prenom && form.sexe && form.date_naissance && form.lieu_naissance && form.telephone && form.email && form.adresse;
    if (step === 1) return form.domaine && form.filiere && form.promotion;
    if (step === 2) return !!photoFile;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <img
              src={logoUpg}
              alt="Logo UPG"
              className="h-20 w-20 rounded-full object-cover border-4 border-primary/20 shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Université Polytechnique de Goma
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Formulaire d'inscription en ligne — Année académique {form.annee_academique}
              </p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                    i < step ? "bg-primary text-primary-foreground shadow-primary/25" :
                    i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-primary/25" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i < step ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:inline",
                    i <= step ? "text-primary" : "text-muted-foreground"
                  )}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "w-12 sm:w-20 h-0.5 mx-2 rounded-full transition-all duration-300",
                    i < step ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        <Card className="border-0 shadow-xl bg-card/95 backdrop-blur">
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-primary">
              Étape {step + 1} sur {steps.length} — {steps[step].label}
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Nom <span className="text-destructive">*</span></Label>
                  <Input value={form.nom} onChange={e => update('nom', e.target.value)} placeholder="Votre nom" />
                </div>
                <div className="space-y-1.5">
                  <Label>Postnom <span className="text-destructive">*</span></Label>
                  <Input value={form.postnom} onChange={e => update('postnom', e.target.value)} placeholder="Votre postnom" />
                </div>
                <div className="space-y-1.5">
                  <Label>Prénom <span className="text-destructive">*</span></Label>
                  <Input value={form.prenom} onChange={e => update('prenom', e.target.value)} placeholder="Votre prénom" />
                </div>
                <div className="space-y-1.5">
                  <Label>Sexe <span className="text-destructive">*</span></Label>
                  <Select value={form.sexe} onValueChange={v => update('sexe', v)}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date de naissance <span className="text-destructive">*</span></Label>
                  <Input type="date" value={form.date_naissance} onChange={e => update('date_naissance', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Lieu de naissance <span className="text-destructive">*</span></Label>
                  <Input value={form.lieu_naissance} onChange={e => update('lieu_naissance', e.target.value)} placeholder="Lieu de naissance" />
                </div>
                <div className="space-y-1.5">
                  <Label>Nationalité</Label>
                  <Input value={form.nationalite} onChange={e => update('nationalite', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Téléphone <span className="text-destructive">*</span></Label>
                  <Input value={form.telephone} onChange={e => update('telephone', e.target.value)} placeholder="+243 ..." />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Email <span className="text-destructive">*</span></Label>
                  <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@exemple.com" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Adresse <span className="text-destructive">*</span></Label>
                  <Input value={form.adresse} onChange={e => update('adresse', e.target.value)} placeholder="Votre adresse complète" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Domaine <span className="text-destructive">*</span></Label>
                  <Select value={form.domaine} onValueChange={v => { update('domaine', v); update('filiere', ''); }}>
                    <SelectTrigger><SelectValue placeholder="Choisir un domaine" /></SelectTrigger>
                    <SelectContent>
                      {DOMAINS.map(d => <SelectItem key={d.nom} value={d.nom}>{d.nom}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Filière <span className="text-destructive">*</span></Label>
                  <Select value={form.filiere} onValueChange={v => update('filiere', v)} disabled={!selectedDomain}>
                    <SelectTrigger><SelectValue placeholder="Choisir une filière" /></SelectTrigger>
                    <SelectContent>
                      {selectedDomain?.filieres.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Promotion <span className="text-destructive">*</span></Label>
                  <Select value={form.promotion} onValueChange={v => update('promotion', v)}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      {PROMOTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Année académique</Label>
                  <Input value={form.annee_academique} onChange={e => update('annee_academique', e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  📷 La photo passeport est <strong>obligatoire</strong>. Les autres documents sont facultatifs.
                </p>
                <div className="space-y-1.5">
                  <Label>Photo passeport <span className="text-destructive">*</span></Label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
                        <Upload className="h-6 w-6 text-primary/60 mb-1" />
                        <span className="text-xs text-muted-foreground">Cliquez pour choisir</span>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    </div>
                    {photoPreview && (
                      <img src={photoPreview} alt="Aperçu" className="w-20 h-24 object-cover rounded-lg border-2 border-primary/20 shadow-sm" />
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Diplôme d'État (PDF)</Label>
                  <Input type="file" accept=".pdf" />
                </div>
                <div className="space-y-1.5">
                  <Label>Bulletin des 2 dernières années (PDF)</Label>
                  <Input type="file" accept=".pdf" />
                </div>
                <div className="space-y-1.5">
                  <Label>Attestation de bonne conduite (PDF)</Label>
                  <Input type="file" accept=".pdf" />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t border-border/50">
              {step > 0 ? (
                <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Précédent
                </Button>
              ) : <div />}
              <div>
                {step < 2 ? (
                  <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} size="lg">
                    Suivant <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={submitting || !photoFile} size="lg">
                    {submitting ? 'Envoi...' : "Soumettre l'inscription"} <Check className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()} Université Polytechnique de Goma — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
