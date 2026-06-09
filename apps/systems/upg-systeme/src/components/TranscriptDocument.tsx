import { useCallback, useRef } from 'react';
import type { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, FileDown } from 'lucide-react';
import logoUpg from '@/assets/logo-upg.jpg';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface TranscriptGrade {
  id: string;
  course_code?: string;
  course_nom?: string;
  course_credits?: number;
  note?: number | null;
  total?: number | null;
}

interface TranscriptProps {
  student: Student;
  grades: TranscriptGrade[];
}

function getMention(note: number): string {
  if (note >= 16) return 'Excellent';
  if (note >= 14) return 'Très bien';
  if (note >= 12) return 'Bien';
  if (note >= 10) return 'Passable';
  return 'Ajourné';
}

function generateCodification(student: Student, index: number): string {
  const promo = student.promotion || '';
  let degree = '';
  if (promo.toLowerCase().includes('master')) degree = 'Master';
  else if (promo.toLowerCase().includes('l')) degree = 'Licence';
  else degree = promo;

  const year = student.annee_academique?.split('-')[0] || new Date().getFullYear().toString();
  return `${degree}/N°${String(index).padStart(3, '0')}-A/${year}`;
}

export default function TranscriptDocument({ student, grades }: TranscriptProps) {
  const ref = useRef<HTMLDivElement>(null);

  const totalCredits = grades.reduce((s, g) => s + (g.course_credits || 3), 0);
  const gradedCourses = grades.filter(g => g.note !== null && g.note !== undefined);
  const totalNotes = gradedCourses.reduce((s, g) => s + Number(g.note || 0), 0);
  const maxTotal = grades.length * 20;
  const moyenne = gradedCourses.length > 0 ? totalNotes / gradedCourses.length : 0;
  const pourcentage = maxTotal > 0 ? ((totalNotes / maxTotal) * 100) : 0;
  const mentionGenerale = getMention(moyenne);
  
  // Crédits capitalisés = somme des crédits des cours où l'étudiant a obtenu >= 10/20
  const creditsCapitalises = grades
    .filter(g => g.note !== null && g.note !== undefined && Number(g.note) >= 10)
    .reduce((s, g) => s + (g.course_credits || 3), 0);

  const codification = generateCodification(student, 247);
  const qrData = JSON.stringify({
    version: 1,
    document_type: 'transcript',
    student_id: student.id,
    matricule: student.matricule,
    academic_year: student.annee_academique,
    codification,
    doc_ref: `transcript:${student.id}:${student.annee_academique}`,
  });

  const captureDocument = useCallback(async () => {
    if (!ref.current) return null;
    return toPng(ref.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
    });
  }, []);

  const handlePrint = useCallback(async () => {
    const img = await captureDocument();
    if (!img) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Relevé de Cotes - ${student.matricule}</title>
          <style>
            body { margin: 0; background: #f5f5f5; display: flex; justify-content: center; padding: 16px; }
            img { width: min(100%, 210mm); height: auto; display: block; box-shadow: 0 2px 12px rgba(0,0,0,.12); }
            @media print {
              body { background: white; padding: 0; }
              @page { size: A4; margin: 0; }
              img { width: 210mm; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <img src="${img}" alt="Relevé de cotes" />
          <script>window.onload = () => window.print();<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [captureDocument, student.matricule]);

  const handleExportPDF = useCallback(async () => {
    const img = await captureDocument();
    if (!img) return;

    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    doc.addImage(img, 'PNG', 0, 0, pageW, pageH);
    doc.save(`Releve_${student.matricule || student.nom}.pdf`);
  }, [captureDocument, student.matricule, student.nom]);

  const dateNaissFormatted = student.date_naissance
    ? new Date(student.date_naissance).toLocaleDateString('fr-FR')
    : '';

  return (
    <div>
      <div ref={ref} style={{
        width: 595, minHeight: 842, fontFamily: "'Times New Roman', Times, serif",
        background: 'white', border: '2px solid #0d47a1', padding: '30px 40px',
        lineHeight: 1.6, color: '#1a1a1a'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#e53935', fontWeight: 'bold', letterSpacing: 1 }}>
            Enseignement Supérieur et Universitaire
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 104px', alignItems: 'start', gap: 12, margin: '6px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={logoUpg} alt="Logo" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', marginTop: 2 }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#0d47a1', textTransform: 'uppercase', textAlign: 'center' }}>
              Université Polytechnique de Goma
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ border: '1px solid #ddd', padding: 4, borderRadius: 4, background: 'white' }}>
                <QRCodeSVG value={qrData} size={82} level="L" />
              </div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>
            Commune et ville de Goma, Quartier Lac Vert Avenue Nyarutsiru avant entrée Buhimba.
          </div>
          <div style={{ fontSize: 10, color: '#555' }}>Info@upgoma.org</div>
          <div style={{ height: 2, background: 'linear-gradient(to right, #e53935, #0d47a1)', margin: '8px 0' }} />
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>Secrétariat Général Académique</div>
          <div style={{
            fontSize: 14, fontWeight: 'bold', color: '#0d47a1',
            border: '2px solid #0d47a1', display: 'inline-block',
            padding: '4px 20px', borderRadius: 4, letterSpacing: 1,
            textTransform: 'uppercase', marginTop: 4
          }}>
            Relevé des Cotes {codification}
          </div>
        </div>

        {/* Declaration */}
        <div style={{ fontSize: 12, marginBottom: 16, textAlign: 'justify' }}>
          Je soussigné, <strong>André MUSAVULI BALIKWISHA</strong>, Secrétaire Général Académique,
          déclare et atteste par la présente que le (la) nommé(e) :{' '}
          <strong>{student.nom} {student.postnom} {student.prenom}</strong>,
          Né(e) à <strong>{student.lieu_naissance}</strong>,
          le <strong>{dateNaissFormatted}</strong>,
          a suivi le cours au programme <strong>{student.promotion} LMD</strong> en{' '}
          <strong>{student.domaine} — {student.filiere}</strong>,
          pour l'année Académique : <strong>{student.annee_academique}</strong>,
          et a obtenu les résultats suivants à l'issue de la Première session :
        </div>

        {/* Grades table */}
        <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 12 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#0d47a1', color: 'white', fontSize: 11 }}>Code</th>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#0d47a1', color: 'white', fontSize: 11, textAlign: 'left' }}>Matière / Cours</th>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#0d47a1', color: 'white', fontSize: 11 }}>Crédits</th>
              <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#0d47a1', color: 'white', fontSize: 11 }}>Cotes</th>
            </tr>
          </thead>
          <tbody>
            {grades.map(g => (
              <tr key={g.id}>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px', fontSize: 11, fontFamily: 'monospace', textAlign: 'center' }}>{g.course_code}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px', fontSize: 11 }}>{g.course_nom}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px', fontSize: 11, textAlign: 'center' }}>{g.course_credits || 3}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px', fontSize: 11, textAlign: 'center', fontWeight: 'bold' }}>{g.note !== null && g.note !== undefined ? `${Number(g.note)}/20` : '—'}</td>
              </tr>
            ))}
            {/* TOTAL row */}
            <tr style={{ background: '#e3f2fd', fontWeight: 'bold' }}>
              <td style={{ border: '1px solid #333', padding: '4px 8px', fontSize: 11, textAlign: 'center' }} colSpan={2}>TOTAL</td>
              <td style={{ border: '1px solid #333', padding: '4px 8px', fontSize: 11, textAlign: 'center' }}>{totalCredits}</td>
              <td style={{ border: '1px solid #333', padding: '4px 8px', fontSize: 11, textAlign: 'center' }}>{totalNotes.toFixed(0)}/{maxTotal}</td>
            </tr>
            {/* Pourcentage row */}
            <tr style={{ background: '#e3f2fd' }}>
              <td style={{ border: '1px solid #333', padding: '4px 8px', fontSize: 11, fontWeight: 'bold' }} colSpan={3}>Pourcentage</td>
              <td style={{ border: '1px solid #333', padding: '4px 8px', fontSize: 13, textAlign: 'center', fontWeight: 'bold', color: '#0d47a1' }}>{pourcentage.toFixed(1)}%</td>
            </tr>
            {/* Crédits Capitalisés row */}
            <tr style={{ background: '#e3f2fd' }}>
              <td style={{ border: '1px solid #333', padding: '4px 8px', fontSize: 11, fontWeight: 'bold' }} colSpan={3}>Crédits Capitalisés (cours ≥ 10/20)</td>
              <td style={{ border: '1px solid #333', padding: '4px 8px', fontSize: 13, textAlign: 'center', fontWeight: 'bold', color: '#0d47a1' }}>{creditsCapitalises}/{totalCredits}</td>
            </tr>
            {/* Moyenne row */}
            <tr style={{ background: '#e3f2fd' }}>
              <td style={{ border: '1px solid #333', padding: '4px 8px', fontSize: 11, fontWeight: 'bold' }} colSpan={3}>Moyenne</td>
              <td style={{ border: '1px solid #333', padding: '4px 8px', fontSize: 13, textAlign: 'center', fontWeight: 'bold', color: '#0d47a1' }}>{moyenne.toFixed(1)}/20</td>
            </tr>
            {/* Mention row */}
            <tr style={{ background: '#e3f2fd' }}>
              <td style={{ border: '1px solid #333', padding: '4px 8px', fontSize: 11, fontWeight: 'bold' }} colSpan={3}>Mention</td>
              <td style={{
                border: '1px solid #333', padding: '4px 8px', fontSize: 13, textAlign: 'center', fontWeight: 'bold',
                color: moyenne >= 10 ? '#2e7d32' : '#c62828'
              }}>{mentionGenerale}</td>
            </tr>
          </tbody>
        </table>

        {/* Légende mentions */}
        <div style={{ fontSize: 9, color: '#666', marginBottom: 16, border: '1px solid #e0e0e0', padding: '6px 10px', borderRadius: 4 }}>
          <strong>Barème :</strong> 16–20 = Excellent | 14–15.9 = Très bien | 12–13.9 = Bien | 10–11.9 = Passable | &lt;10 = Ajourné
        </div>

        {/* Footer signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', marginTop: 30 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #999', width: 140, margin: '30px auto 4px' }} />
            Le Secrétaire Général Académique
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #999', width: 140, margin: '30px auto 4px' }} />
            Le Recteur
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button onClick={() => void handlePrint()} size="sm">
          <Download className="h-4 w-4 mr-1" /> Imprimer
        </Button>
        <Button onClick={() => void handleExportPDF()} size="sm" variant="secondary">
          <FileDown className="h-4 w-4 mr-1" /> Exporter PDF
        </Button>
      </div>
    </div>
  );
}
