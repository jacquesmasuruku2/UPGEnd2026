import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Payment, Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Search, FileText } from 'lucide-react';
import PaymentReceipt from '@/components/PaymentReceipt';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<(Payment & { student_name?: string })[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ student_id: '', montant: '', motif: 'Frais académiques', tranche: '1ère tranche', date: new Date().toISOString().split('T')[0] });
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [receiptStudent, setReceiptStudent] = useState<Student | null>(null);

  const load = async () => {
    const { data: pays } = await supabase.from('payments').select('*').order('date', { ascending: false });
    const { data: studs } = await supabase.from('students').select('*').eq('status', 'approved');
    setStudents((studs as Student[]) || []);
    const nameMap: Record<string, string> = {};
    studs?.forEach((s: any) => { nameMap[s.id] = `${s.nom} ${s.postnom} (${s.matricule})`; });
    setPayments((pays || []).map((p: any) => ({ ...p, student_name: nameMap[p.student_id] || 'Inconnu' })));
  };

  useEffect(() => { load(); }, []);

  const addPayment = async () => {
    const { error } = await supabase.from('payments').insert({
      student_id: form.student_id, montant: parseFloat(form.montant),
      motif: form.motif, tranche: form.tranche, date: form.date, created_by: user?.id
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success('Paiement enregistré');
    setOpen(false);
    load();
  };

  const openReceipt = (payment: Payment) => {
    const stud = students.find(s => s.id === payment.student_id);
    if (stud) {
      setReceiptPayment(payment);
      setReceiptStudent(stud);
    }
  };

  const filtered = payments.filter(p => p.student_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Gestion des Paiements</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Nouveau paiement</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Étudiant</Label>
                <Select value={form.student_id} onValueChange={v => setForm(f => ({ ...f, student_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.nom} {s.postnom} — {s.matricule}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Montant ($)</Label><Input type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} /></div>
              <div><Label>Motif</Label><Input value={form.motif} onChange={e => setForm(f => ({ ...f, motif: e.target.value }))} /></div>
              <div>
                <Label>Tranche</Label>
                <Select value={form.tranche} onValueChange={v => setForm(f => ({ ...f, tranche: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1ère tranche">1ère tranche</SelectItem>
                    <SelectItem value="2ème tranche">2ème tranche</SelectItem>
                    <SelectItem value="3ème tranche">3ème tranche</SelectItem>
                    <SelectItem value="Complément">Complément</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <Button onClick={addPayment} className="w-full">Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Rechercher par étudiant..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Étudiant</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Tranche</TableHead>
                <TableHead>Montant ($)</TableHead>
                <TableHead>Reçu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.date}</TableCell>
                  <TableCell className="font-medium">{p.student_name}</TableCell>
                  <TableCell>{p.motif}</TableCell>
                  <TableCell>{p.tranche}</TableCell>
                  <TableCell className="font-bold">{Number(p.montant).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => openReceipt(p)} title="Reçu">
                      <FileText className="h-4 w-4 text-primary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucun paiement</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Receipt dialog */}
      <Dialog open={!!receiptPayment} onOpenChange={() => { setReceiptPayment(null); setReceiptStudent(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Reçu de Paiement</DialogTitle></DialogHeader>
          {receiptPayment && receiptStudent && <PaymentReceipt payment={receiptPayment} student={receiptStudent} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
