import { useRef, useCallback } from 'react';
import type { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, FileImage, FileText, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import logoUpg from '@/assets/logo-upg.jpg';
import armoiriesRdc from '@/assets/armoiries-rdc.png';

interface StudentCardProps {
  student: Student;
}

const CARD_W = 325;
const CARD_H = 204;
const LABEL_W = 62;

export default function StudentCard({ student }: StudentCardProps) {
  const rectoRef = useRef<HTMLDivElement>(null);
  const versoRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const qrData = JSON.stringify({
    version: 1,
    document_type: 'student_card',
    student_id: student.id,
    matricule: student.matricule,
    nom: `${student.nom} ${student.postnom} ${student.prenom}`.trim(),
    academic_year: student.annee_academique,
    doc_ref: `student_card:${student.id}:${student.annee_academique}`,
  });

  const captureCard = useCallback(async (node: HTMLDivElement): Promise<string> => {
    return toPng(node, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
    });
  }, []);

  const handleExportPNG = useCallback(async () => {
    if (!rectoRef.current || !versoRef.current) return;
    const [rectoImg, versoImg] = await Promise.all([
      captureCard(rectoRef.current),
      captureCard(versoRef.current),
    ]);
    for (const [img, label] of [[rectoImg, 'recto'], [versoImg, 'verso']] as const) {
      const link = document.createElement('a');
      link.download = `Carte_${student.matricule}_${label}.png`;
      link.href = img;
      link.click();
    }
  }, [student.matricule, captureCard]);

  const handleExportPDF = useCallback(async () => {
    if (!rectoRef.current || !versoRef.current) return;
    const [rectoImg, versoImg] = await Promise.all([
      captureCard(rectoRef.current),
      captureCard(versoRef.current),
    ]);
    const pdfW = 86;
    const pdfH = 54;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [pdfW, pdfH] });
    doc.addImage(rectoImg, 'PNG', 0, 0, pdfW, pdfH);
    doc.addPage([pdfW, pdfH], 'landscape');
    doc.addImage(versoImg, 'PNG', 0, 0, pdfW, pdfH);
    doc.save(`Carte_${student.matricule}.pdf`);
  }, [student.matricule, captureCard]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !cardRef.current) return;
    printWindow.document.write(`
      <html><head><title>Carte Étudiant - ${student.matricule}</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; font-family: 'Segoe UI', Arial, sans-serif; }
        .pages { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
        @media print {
          body { background: white; }
          @page { size: 86mm 54mm; margin: 0; }
        }
      </style></head><body>
      <div class="pages">${cardRef.current.innerHTML}</div>
      <script>window.onload = () => window.print();<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const fields: [string, string][] = [
    ['Nom', student.nom],
    ['Postnom', student.postnom],
    ['Prénom', student.prenom],
    ['Date Naiss.', new Date(student.date_naissance).toLocaleDateString('fr-FR')],
    ['Lieu Naiss.', student.lieu_naissance],
    ['Année Acad.', student.annee_academique],
    ['Faculté', `${student.domaine} — ${student.filiere}`],
    ['Promotion', student.promotion],
  ];

  return (
    <div>
      <div ref={cardRef} className="flex flex-col sm:flex-row gap-4 items-start">
        {/* RECTO */}
        <div ref={rectoRef} style={{
          width: CARD_W, height: CARD_H, borderRadius: 8, overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', background: 'white',
          fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif", display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4fc3f7, #0288d1)', color: 'white',
            padding: '4px 8px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <img src={logoUpg} alt="Logo UPG" style={{ width: 30, height: 30, borderRadius: 4, objectFit: 'contain', border: '1px solid rgba(255,255,255,0.4)', background: 'white', padding: 1 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 5.5, textTransform: 'uppercase', letterSpacing: 0.5, color: '#000', fontWeight: 'bold' }}>
                République Démocratique du Congo
              </div>
              <div style={{ fontSize: 5.5, textTransform: 'uppercase', letterSpacing: 0.5, color: '#e53935', fontWeight: 'bold' }}>
                Enseignement Supérieur et Universitaire
              </div>
              <div style={{ fontSize: 8, fontWeight: 'bold', margin: '1px 0', color: 'white' }}>
                Université Polytechnique de Goma
              </div>
              <div style={{ fontSize: 6, fontWeight: 'bold', letterSpacing: 1, color: 'white' }}>CARTE D'ÉTUDIANT</div>
            </div>
            <img src={armoiriesRdc} alt="Armoiries RDC" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>

          <div style={{ flex: 1, padding: '5px 8px', display: 'flex', gap: 8, position: 'relative' }}>
            <img src={logoUpg} alt="" style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 90, height: 90, opacity: 0.12, objectFit: 'cover',
              borderRadius: '50%', pointerEvents: 'none'
            }} />
            {student.photo_url ? (
              <img src={student.photo_url} alt="Photo" style={{
                width: 58, height: 72, borderRadius: 4, objectFit: 'cover',
                border: '1.5px solid #0288d1', flexShrink: 0, position: 'relative', zIndex: 1
              }} />
            ) : (
              <div style={{
                width: 58, height: 72, borderRadius: 4, border: '1.5px solid #0288d1',
                flexShrink: 0, background: '#e3f2fd', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#90caf9', fontSize: 8, position: 'relative', zIndex: 1
              }}>Photo</div>
            )}
            <div style={{ flex: 1, fontSize: 7, lineHeight: 1.3, position: 'relative', zIndex: 1 }}>
              {fields.map(([label, value]) => (
                <div key={label} style={{ marginBottom: 1, display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ color: '#666', fontSize: 5.5, textTransform: 'uppercase', letterSpacing: 0.3, width: LABEL_W, minWidth: LABEL_W, display: 'inline-block' }}>{label} :</span>
                  <span style={{ color: '#1a1a1a', fontWeight: 700, flex: 1 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #0d47a1, #1a1a1a)', color: 'white',
            textAlign: 'center', padding: '3px 8px', fontSize: 8, fontWeight: 'bold',
            letterSpacing: 1.5
          }}>
            {student.matricule}
          </div>
        </div>

        {/* VERSO */}
        <div ref={versoRef} style={{
          width: CARD_W, height: CARD_H, borderRadius: 8, overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', background: 'white',
          fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif", display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4fc3f7, #0288d1)', color: 'white',
            padding: '5px 8px', textAlign: 'center', fontSize: 7, fontWeight: 'bold',
            textTransform: 'uppercase', letterSpacing: 1
          }}>
            Université Polytechnique de Goma
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '4px 10px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <img src={logoUpg} alt="" style={{
                position: 'absolute', top: '38%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 80, height: 80, opacity: 0.12, objectFit: 'cover',
                borderRadius: '50%', pointerEvents: 'none'
              }} />
              <QRCodeSVG value={qrData} size={72} level="L" style={{ position: 'relative', zIndex: 1 }} />
              <div style={{ flex: 1, fontSize: 6.5, lineHeight: 1.5, color: '#333', position: 'relative', zIndex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 7, marginBottom: 2, color: '#0d47a1' }}>Contacts</div>
                <div>Avenue Nyarutsiru, Q. Lac Vert, Com. et Ville de Goma</div>
                <div>+243 977831973</div>
                <div>info@upgoma.org</div>
                <div>www.upgoma.com</div>
              </div>
            </div>
            <div style={{
              fontSize: 8, fontWeight: 'bold', color: '#0d47a1', textAlign: 'center',
              textTransform: 'uppercase', letterSpacing: 1.5, position: 'relative', zIndex: 1
            }}>
              LAISSEZ-PASSER
            </div>
          </div>

          <div style={{
            padding: '2px 10px', fontSize: 6.5, color: '#0d47a1', textAlign: 'right',
            fontWeight: 'bold', letterSpacing: 0.5
          }}>
            Date d'expiration : 01/2027
          </div>

          <div style={{
            padding: '3px 10px', fontSize: 5.5, color: '#333', textAlign: 'center',
            fontWeight: 'bold', lineHeight: 1.3, borderTop: '1px solid #e0e0e0'
          }}>
            Les autorités tant civiles et militaires sont priées d'apporter assistance au porteur de la présente en cas de nécessité.
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #0d47a1, #1a1a1a)', color: 'white',
            textAlign: 'center', padding: '3px 8px', fontSize: 5.5, borderTop: '2px solid #e53935',
            opacity: 0.9
          }}>
            Cette carte est strictement personnelle et non transférable.
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button onClick={handlePrint} size="sm" variant="outline">
          <Printer className="h-4 w-4 mr-1" /> Imprimer
        </Button>
        <Button onClick={handleExportPNG} size="sm" variant="outline">
          <FileImage className="h-4 w-4 mr-1" /> PNG
        </Button>
        <Button onClick={handleExportPDF} size="sm">
          <FileText className="h-4 w-4 mr-1" /> PDF
        </Button>
      </div>
    </div>
  );
}
