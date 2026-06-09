import { useCallback, useRef } from 'react';
import type { Payment, Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, FileDown } from 'lucide-react';
import logoUpg from '@/assets/logo-upg.jpg';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface PaymentReceiptProps {
  payment: Payment;
  student: Student;
}

export default function PaymentReceipt({ payment, student }: PaymentReceiptProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrData = JSON.stringify({
    version: 1,
    document_type: 'payment_receipt',
    payment_id: payment.id,
    student_id: student.id,
    matricule: student.matricule,
    amount: Number(payment.montant),
    date: payment.date,
    doc_ref: `payment_receipt:${payment.id}`,
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
          <title>Reçu de Paiement</title>
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
          <img src="${img}" alt="Reçu de paiement" />
          <script>window.onload = () => window.print();<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [captureDocument]);

  const handleExportPDF = useCallback(async () => {
    const img = await captureDocument();
    if (!img) return;

    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    doc.addImage(img, 'PNG', 0, 0, pageW, pageH);
    doc.save(`Recu_${payment.id.slice(0, 8)}_${student.nom}.pdf`);
  }, [captureDocument, payment.id, student.nom]);

  return (
    <div>
      <div ref={ref} style={{
        width: 595, minHeight: 400, fontFamily: "'Times New Roman', Times, serif",
        border: '2px solid #0d47a1', borderRadius: 8, overflow: 'hidden', background: 'white'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 30px 14px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#e53935', fontWeight: 'bold', letterSpacing: 1 }}>
            Enseignement Supérieur et Universitaire
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 104px', alignItems: 'start', gap: 12, margin: '6px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={logoUpg} alt="Logo UPG" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', marginTop: 2 }} />
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
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>Service de la comptabilité</div>
          <div style={{
            fontSize: 14, fontWeight: 'bold', color: '#0d47a1',
            border: '2px solid #0d47a1', display: 'inline-block',
            padding: '4px 20px', borderRadius: 4, letterSpacing: 1,
            textTransform: 'uppercase', marginTop: 4
          }}>
            Reçu de Paiement
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 11, color: '#666' }}>
            <span>N° {payment.id.slice(0, 8).toUpperCase()}</span>
            <span>Date: {new Date(payment.date).toLocaleDateString('fr-FR')}</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
            <tbody>
              {[
                ['Étudiant', `${student.nom} ${student.postnom} ${student.prenom}`],
                ['Matricule', student.matricule || '—'],
                ['Filière', `${student.filiere} — ${student.promotion}`],
                ['Année Académique', student.annee_academique],
                ['Motif', payment.motif],
                ['Tranche', payment.tranche],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: '6px 10px', color: '#666', width: 160, borderBottom: '1px solid #eee' }}>{label} :</td>
                  <td style={{ padding: '6px 10px', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 16, padding: '14px 20px', background: '#e3f2fd', borderRadius: 6, textAlign: 'center', border: '1px solid #90caf9' }}>
            <div style={{ fontSize: 11, color: '#666' }}>Montant payé</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0d47a1' }}>{Number(payment.montant).toLocaleString()} $</div>
          </div>

          <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #999', width: 140, margin: '40px auto 4px' }} />
              Signature de l'étudiant
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #999', width: 140, margin: '40px auto 4px' }} />
              Cachet et signature
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#f5f5f5', padding: '8px 30px', fontSize: 9, color: '#999', textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
          Commune et ville de Goma, Quartier Lac Vert, Avenue Nyarutsiru avant entrée Buhimba • +243 973380118 • info@upgoma.org
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
