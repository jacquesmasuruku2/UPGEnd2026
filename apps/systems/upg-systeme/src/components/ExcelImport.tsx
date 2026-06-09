import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const COLUMN_MAP: Record<string, string> = {
  'nom': 'nom', 'name': 'nom', 'surname': 'nom',
  'postnom': 'postnom', 'middle name': 'postnom',
  'prenom': 'prenom', 'prénom': 'prenom', 'first name': 'prenom', 'firstname': 'prenom',
  'sexe': 'sexe', 'genre': 'sexe', 'sex': 'sexe',
  'date_naissance': 'date_naissance', 'date de naissance': 'date_naissance', 'birthday': 'date_naissance', 'dob': 'date_naissance',
  'lieu_naissance': 'lieu_naissance', 'lieu de naissance': 'lieu_naissance', 'birthplace': 'lieu_naissance',
  'nationalite': 'nationalite', 'nationalité': 'nationalite', 'nationality': 'nationalite',
  'telephone': 'telephone', 'téléphone': 'telephone', 'tel': 'telephone', 'phone': 'telephone',
  'email': 'email', 'e-mail': 'email', 'mail': 'email',
  'adresse': 'adresse', 'address': 'adresse',
  'domaine': 'domaine', 'domain': 'domaine',
  'filiere': 'filiere', 'filière': 'filiere', 'department': 'filiere',
  'promotion': 'promotion', 'level': 'promotion', 'classe': 'promotion',
  'annee_academique': 'annee_academique', 'année académique': 'annee_academique', 'academic year': 'annee_academique',
};

const REQUIRED = ['nom', 'postnom', 'prenom', 'sexe', 'date_naissance', 'lieu_naissance', 'telephone', 'email', 'adresse', 'domaine', 'filiere', 'promotion'];

interface ParsedRow {
  data: Record<string, string>;
  valid: boolean;
  errors: string[];
}

export default function ExcelImport({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const mapColumn = (col: string): string | null => {
    const key = col.toLowerCase().trim().replace(/[_\s]+/g, ' ').replace(/é/g, 'e');
    for (const [pattern, field] of Object.entries(COLUMN_MAP)) {
      if (key === pattern || key.includes(pattern)) return field;
    }
    // Direct match
    if (REQUIRED.includes(col.toLowerCase().trim())) return col.toLowerCase().trim();
    return null;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'binary', cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

      if (!json.length) { toast.error('Fichier vide'); return; }

      // Map headers
      const headers = Object.keys(json[0]);
      const headerMap: Record<string, string> = {};
      headers.forEach(h => {
        const mapped = mapColumn(h);
        if (mapped) headerMap[h] = mapped;
      });

      const parsed: ParsedRow[] = json.map(row => {
        const data: Record<string, string> = {};
        Object.entries(headerMap).forEach(([orig, field]) => {
          let val = String(row[orig] ?? '').trim();
          if (field === 'date_naissance' && row[orig] instanceof Date) {
            val = row[orig].toISOString().split('T')[0];
          }
          if (field === 'sexe') val = val.toUpperCase().startsWith('F') ? 'F' : 'M';
          data[field] = val;
        });

        // Defaults
        if (!data.nationalite) data.nationalite = 'Congolaise';
        if (!data.annee_academique) data.annee_academique = '2025-2026';

        const errors: string[] = [];
        REQUIRED.forEach(f => { if (!data[f]) errors.push(f); });
        return { data, valid: errors.length === 0, errors };
      });

      setRows(parsed);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    const validRows = rows.filter(r => r.valid);
    if (!validRows.length) { toast.error('Aucune ligne valide'); return; }

    setImporting(true);
    const records = validRows.map(r => ({ ...r.data, status: 'pending' }));

    const { error } = await supabase.from('students').insert(records as any);
    setImporting(false);

    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success(`${validRows.length} étudiant(s) importé(s) avec succès`);
      setRows([]);
      setOpen(false);
      onImported();
    }
  };

  const validCount = rows.filter(r => r.valid).length;
  const invalidCount = rows.filter(r => !r.valid).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-1" /> Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importation en masse — Fichier Excel</DialogTitle>
        </DialogHeader>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Chargez un fichier Excel (.xlsx, .xls) avec les colonnes : <strong>Nom, Postnom, Prénom, Sexe, Date de naissance, Lieu de naissance, Téléphone, Email, Adresse, Domaine, Filière, Promotion</strong>
            </p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            <Button onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1" /> Choisir un fichier
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3 items-center">
              <Badge variant="default">{validCount} valide(s)</Badge>
              {invalidCount > 0 && <Badge variant="destructive">{invalidCount} erreur(s)</Badge>}
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setRows([]); if (fileRef.current) fileRef.current.value = ''; }}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleImport} disabled={importing || validCount === 0}>
                  {importing ? 'Importation...' : `Importer ${validCount} étudiant(s)`}
                  <Check className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Postnom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Filière</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 50).map((r, i) => (
                    <TableRow key={i} className={r.valid ? '' : 'bg-destructive/5'}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>{r.data.nom || '—'}</TableCell>
                      <TableCell>{r.data.postnom || '—'}</TableCell>
                      <TableCell>{r.data.prenom || '—'}</TableCell>
                      <TableCell className="text-sm">{r.data.email || '—'}</TableCell>
                      <TableCell className="text-sm">{r.data.filiere || '—'}</TableCell>
                      <TableCell>
                        {r.valid ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" /> {r.errors.join(', ')}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rows.length > 50 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Affichage limité aux 50 premières lignes ({rows.length} total)
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
