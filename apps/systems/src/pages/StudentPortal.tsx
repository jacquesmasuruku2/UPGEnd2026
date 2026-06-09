import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Payment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, CreditCard, ClipboardList } from 'lucide-react';

function getMention(note: number): string {
  if (note >= 16) return 'Excellent';
  if (note >= 14) return 'Très bien';
  if (note >= 12) return 'Bien';
  if (note >= 10) return 'Passable';
  return 'Ajourné';
}

export default function StudentPortal() {
  const { user } = useAuth();
  const student = user?.studentData;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    if (!student) return;
    const load = async () => {
      const { data: pays } = await supabase.from('payments').select('*').eq('student_id', student.id).order('date', { ascending: false });
      const payList = (pays as Payment[]) || [];
      setPayments(payList);
      setTotalPaid(payList.reduce((s, p) => s + Number(p.montant), 0));

      const { data: grs } = await supabase.from('grades').select('*').eq('student_id', student.id).eq('published', true);
      if (grs) {
        const courseIds = [...new Set(grs.map((g: any) => g.course_id))];
        if (courseIds.length > 0) {
          const { data: courses } = await supabase.from('courses').select('id, code, nom, credits').in('id', courseIds);
          const courseMap: Record<string, { code: string; nom: string; credits: number }> = {};
          courses?.forEach((c: any) => { courseMap[c.id] = { code: c.code, nom: c.nom, credits: c.credits }; });
          setGrades(grs.map((g: any) => ({
            ...g,
            course_code: courseMap[g.course_id]?.code,
            course_nom: courseMap[g.course_id]?.nom,
            course_credits: courseMap[g.course_id]?.credits || 3
          })));
        } else {
          setGrades([]);
        }
      }
    };
    load();
  }, [student]);

  if (!student) {
    return <div className="text-center py-12 text-muted-foreground">Données étudiant non trouvées. Vérifiez que votre inscription est approuvée.</div>;
  }

  const totalCredits = grades.reduce((s, g) => s + (g.course_credits || 3), 0);
  const totalWeightedNotes = grades.reduce((s, g) => s + (Number(g.note || 0) * (g.course_credits || 3)), 0);
  const moyennePonderee = totalCredits > 0 ? (totalWeightedNotes / totalCredits) : 0;
  const maxTotal = totalCredits * 20;
  const pourcentage = maxTotal > 0 ? ((totalWeightedNotes / maxTotal) * 100) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Mon Portail Étudiant</h2>

      <Tabs defaultValue="profil">
        <TabsList className="mb-4">
          <TabsTrigger value="profil"><User className="h-4 w-4 mr-1" /> Profil</TabsTrigger>
          <TabsTrigger value="frais"><CreditCard className="h-4 w-4 mr-1" /> Mes Frais</TabsTrigger>
          <TabsTrigger value="releve"><ClipboardList className="h-4 w-4 mr-1" /> Relevé de Cotes</TabsTrigger>
        </TabsList>

        <TabsContent value="profil">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Matricule" value={student.matricule || '—'} />
                <Info label="Nom complet" value={`${student.nom} ${student.postnom} ${student.prenom}`} />
                <Info label="Sexe" value={student.sexe} />
                <Info label="Date de naissance" value={student.date_naissance} />
                <Info label="Lieu de naissance" value={student.lieu_naissance} />
                <Info label="Nationalité" value={student.nationalite} />
                <Info label="Téléphone" value={student.telephone} />
                <Info label="Email" value={student.email} />
                <Info label="Adresse" value={student.adresse} />
                <Info label="Domaine" value={student.domaine} />
                <Info label="Filière" value={student.filiere} />
                <Info label="Promotion" value={student.promotion} />
                <Info label="Année académique" value={student.annee_academique} />
                <Info label="Statut" value={student.status === 'approved' ? 'Approuvé ✓' : student.status} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frais">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Historique des paiements</span>
                <Badge variant="default">Total payé: {totalPaid.toLocaleString()} $</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Tranche</TableHead>
                    <TableHead>Montant ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{p.motif}</TableCell>
                      <TableCell>{p.tranche}</TableCell>
                      <TableCell className="font-bold">{Number(p.montant).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {payments.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Aucun paiement enregistré</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="releve">
          <Card>
            <CardHeader><CardTitle>Relevé de Cotes</CardTitle></CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Cours</TableHead>
                        <TableHead>Crédits</TableHead>
                        <TableHead>Note (/20)</TableHead>
                        <TableHead>Mention</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grades.map(g => (
                        <TableRow key={g.id}>
                          <TableCell className="font-mono">{g.course_code}</TableCell>
                          <TableCell>{g.course_nom}</TableCell>
                          <TableCell className="text-center">{g.course_credits || 3}</TableCell>
                          <TableCell className="font-bold">{Number(g.note || 0)}/20</TableCell>
                          <TableCell>{getMention(Number(g.note || 0))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex gap-6 mt-4 p-3 rounded-md bg-secondary flex-wrap">
                    <div><span className="text-sm text-muted-foreground">Total crédits:</span> <strong>{totalCredits}</strong></div>
                    <div><span className="text-sm text-muted-foreground">Moyenne pondérée:</span> <strong>{moyennePonderee.toFixed(2)}/20</strong></div>
                    <div><span className="text-sm text-muted-foreground">Pourcentage:</span> <strong>{pourcentage.toFixed(1)}%</strong></div>
                    <div><span className="text-sm text-muted-foreground">Mention:</span> <strong>{getMention(moyennePonderee)}</strong></div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune cote publiée disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
