import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Student } from '@/types';

interface TranscriptGrade {
  course_code?: string;
  course_nom?: string;
  course_credits?: number;
  note?: number;
}

interface PaymentData {
  id: string;
  date: string;
  montant: number;
  motif: string;
  tranche: string;
}

function getMention(note: number): string {
  if (note >= 16) return 'Excellent';
  if (note >= 14) return 'Très bien';
  if (note >= 12) return 'Bien';
  if (note >= 10) return 'Passable';
  return 'Ajourné';
}

function generateCodification(student: Student): string {
  const promo = student.promotion || '';
  let degree = '';
  if (promo.toLowerCase().includes('master')) degree = 'Master';
  else if (promo.toLowerCase().includes('l')) degree = 'Licence';
  else degree = promo;
  const year = student.annee_academique?.split('-')[0] || new Date().getFullYear().toString();
  return `${degree}/N°247-A/${year}`;
}

function addHeader(doc: jsPDF, title: string) {
  const w = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(9);
  doc.setTextColor(200, 30, 30);
  doc.text('ENSEIGNEMENT SUPÉRIEUR ET UNIVERSITAIRE', w / 2, 18, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(13, 71, 161);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITÉ POLYTECHNIQUE DE GOMA', w / 2, 26, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Commune et ville de Goma, Quartier Lac Vert Avenue Nyarutsiru avant entrée Buhimba.', w / 2, 32, { align: 'center' });
  doc.text('Info@upgoma.org', w / 2, 36, { align: 'center' });

  // Line
  doc.setDrawColor(200, 30, 30);
  doc.setLineWidth(0.5);
  doc.line(20, 39, w - 20, 39);
  doc.setDrawColor(13, 71, 161);
  doc.line(20, 40, w - 20, 40);

  doc.setFontSize(10);
  doc.setTextColor(50);
  doc.setFont('helvetica', 'bold');
  doc.text('Secrétariat Général Académique', w / 2, 46, { align: 'center' });

  // Title box
  doc.setFontSize(12);
  doc.setTextColor(13, 71, 161);
  const titleWidth = doc.getTextWidth(title) + 16;
  const titleX = (w - titleWidth) / 2;
  doc.setDrawColor(13, 71, 161);
  doc.setLineWidth(0.8);
  doc.rect(titleX, 49, titleWidth, 10);
  doc.text(title, w / 2, 56, { align: 'center' });
}

export function exportTranscriptPDF(student: Student, grades: TranscriptGrade[]) {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const w = doc.internal.pageSize.getWidth();

  const codification = generateCodification(student);
  addHeader(doc, `RELEVÉ DES COTES ${codification}`);

  // Declaration text
  const dateNaiss = student.date_naissance
    ? new Date(student.date_naissance).toLocaleDateString('fr-FR')
    : '';

  doc.setFontSize(10);
  doc.setTextColor(30);
  doc.setFont('helvetica', 'normal');

  const declaration = `Je soussigné, André MUSAVULI BALIKWISHA, Secrétaire Général Académique, déclare et atteste par la présente que le (la) nommé(e) : ${student.nom} ${student.postnom} ${student.prenom}, Né(e) à ${student.lieu_naissance}, le ${dateNaiss}, a suivi le cours au programme ${student.promotion} LMD en ${student.domaine} — ${student.filiere}, pour l'année Académique : ${student.annee_academique}, et a obtenu les résultats suivants à l'issue de la Première session :`;

  const lines = doc.splitTextToSize(declaration, w - 40);
  doc.text(lines, 20, 68);

  const tableStartY = 68 + lines.length * 5 + 4;

  // Table data
  const totalCredits = grades.reduce((s, g) => s + (g.course_credits || 3), 0);
  const totalWeighted = grades.reduce((s, g) => s + (Number(g.note || 0) * (g.course_credits || 3)), 0);
  const maxTotal = totalCredits * 20;
  const moyennePonderee = totalCredits > 0 ? totalWeighted / totalCredits : 0;
  const pourcentage = maxTotal > 0 ? (totalWeighted / maxTotal) * 100 : 0;
  const mention = getMention(moyennePonderee);

  const body = grades.map(g => [
    g.course_code || '',
    g.course_nom || '',
    String(g.course_credits || 3),
    `${Number(g.note || 0)}/20`
  ]);

  body.push([
    { content: 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold' as const, fillColor: [227, 242, 253] as [number, number, number] } } as any,
    { content: String(totalCredits), styles: { fontStyle: 'bold' as const, fillColor: [227, 242, 253] as [number, number, number] } },
    { content: `${totalWeighted.toFixed(0)}/${maxTotal}`, styles: { fontStyle: 'bold' as const, fillColor: [227, 242, 253] as [number, number, number] } }
  ]);

  body.push([
    { content: 'Pourcentage', colSpan: 3, styles: { fontStyle: 'bold' as const, fillColor: [227, 242, 253] as [number, number, number] } } as any,
    { content: `${pourcentage.toFixed(1)}%`, styles: { fontStyle: 'bold' as const, textColor: [13, 71, 161] as [number, number, number], fillColor: [227, 242, 253] as [number, number, number] } }
  ]);

  body.push([
    { content: 'Mention', colSpan: 3, styles: { fontStyle: 'bold' as const, fillColor: [227, 242, 253] as [number, number, number] } } as any,
    { content: mention, styles: { fontStyle: 'bold' as const, textColor: moyennePonderee >= 10 ? [46, 125, 50] as [number, number, number] : [198, 40, 40] as [number, number, number], fillColor: [227, 242, 253] as [number, number, number] } }
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Code', 'Matière / Cours', 'Crédits', 'Cotes']],
    body,
    theme: 'grid',
    headStyles: { fillColor: [13, 71, 161], textColor: 255, fontSize: 10, halign: 'center' },
    styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 25 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 25 }
    },
    margin: { left: 20, right: 20 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 200;

  // Barème
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('Barème : 16–20 = Excellent | 14–15.9 = Très bien | 12–13.9 = Bien | 10–11.9 = Passable | <10 = Ajourné', 20, finalY + 8);

  // Signatures
  const sigY = finalY + 30;
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.setDrawColor(150);
  doc.line(25, sigY, 80, sigY);
  doc.text('Le Secrétaire Général Académique', 28, sigY + 5);
  doc.line(w - 80, sigY, w - 25, sigY);
  doc.text('Le Recteur', w - 65, sigY + 5);

  doc.save(`Releve_${student.matricule || student.nom}.pdf`);
}

export function exportReceiptPDF(payment: PaymentData, student: Student) {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const w = doc.internal.pageSize.getWidth();

  addHeader(doc, 'REÇU DE PAIEMENT');

  let y = 66;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`N° ${payment.id.slice(0, 8).toUpperCase()}`, 20, y);
  doc.text(`Date: ${new Date(payment.date).toLocaleDateString('fr-FR')}`, w - 20, y, { align: 'right' });

  y += 10;

  const infoRows = [
    ['Étudiant', `${student.nom} ${student.postnom} ${student.prenom}`],
    ['Matricule', student.matricule || '—'],
    ['Filière', `${student.filiere} — ${student.promotion}`],
    ['Année Académique', student.annee_academique],
    ['Motif', payment.motif],
    ['Tranche', payment.tranche],
  ];

  autoTable(doc, {
    startY: y,
    body: infoRows.map(([label, value]) => [label, value]),
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { textColor: [120, 120, 120], cellWidth: 50 },
      1: { fontStyle: 'bold' }
    },
    margin: { left: 20, right: 20 }
  });

  const tableEnd = (doc as any).lastAutoTable?.finalY || y + 50;

  // Montant box
  const boxY = tableEnd + 10;
  doc.setFillColor(227, 242, 253);
  doc.setDrawColor(144, 202, 249);
  doc.roundedRect(40, boxY, w - 80, 30, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Montant payé', w / 2, boxY + 10, { align: 'center' });
  doc.setFontSize(22);
  doc.setTextColor(13, 71, 161);
  doc.setFont('helvetica', 'bold');
  doc.text(`${Number(payment.montant).toLocaleString()} $`, w / 2, boxY + 23, { align: 'center' });

  // Signatures
  const sigY = boxY + 50;
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(150);
  doc.line(25, sigY, 80, sigY);
  doc.text('Signature de l\'étudiant', 30, sigY + 5);
  doc.line(w - 80, sigY, w - 25, sigY);
  doc.text('Cachet et signature', w - 75, sigY + 5);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(170);
  doc.text('Commune et ville de Goma, Quartier Lac Vert, Avenue Nyarutsiru avant entrée Buhimba • +243 973380118 • info@upgoma.org', w / 2, 280, { align: 'center' });

  doc.save(`Recu_${payment.id.slice(0, 8)}_${student.nom}.pdf`);
}
