import { useRef } from 'react';
import type { Payment, Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, FileDown } from 'lucide-react';
import logoUpg from '@/assets/logo-upg.jpg';
import { exportReceiptPDF } from '@/lib/pdf-export';

interface PaymentReceiptProps {
  payment: Payment;
  student: Student;
}

export default function PaymentReceipt({ payment, student }: PaymentReceiptProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !ref.current) return;
    printWindow.document.write(`
      <html><head><title>Reçu de Paiement</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { display: flex; justify-content: center; padding: 0; font-family: 'Times New Roman', Times, serif; }
        @media print { @page { size: A4; margin: 20mm; } body { padding: 0; } }
      </style></head><body>
      ${ref.current.innerHTML}
      <script>window.onload = () => window.print();<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <div ref={ref} style={{
        width: 595, minHeight: 400, fontFamily: "'Times New Roman', Times, serif",
        border: '2px solid #0d47a1', borderRadius: 8, overflow: 'hidden', background: 'white'
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0288d1, #0d47a1)', color: 'white', padding: '20px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#ffcdd2', letterSpacing: 1 }}>Enseignement Supérieur et Universitaire</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '8px 0' }}>
            <img src={logoUpg} alt="Logo UPG" style={{ width: 45, height: 45, borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ fontSize: 16, fontWeight: 'bold' }}>Université Polytechnique de Goma</div>
          </div>
          <div style={{ fontSize: 14, marginTop: 6, background: '#e53935', display: 'inline-block', padding: '4px 20px', borderRadius: 4, fontWeight: 'bold', letterSpacing: 1 }}>REÇU DE PAIEMENT</div>
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
        <Button onClick={handlePrint} size="sm">
          <Download className="h-4 w-4 mr-1" /> Imprimer
        </Button>
        <Button onClick={() => exportReceiptPDF(payment, student)} size="sm" variant="secondary">
          <FileDown className="h-4 w-4 mr-1" /> Exporter PDF
        </Button>
      </div>
    </div>
  );
}
