/**
 * Icône type carte PDF Adobe : fond rouge, coin replié plus clair,
 * glyphe blanc façon ruban, libellé PDF.
 */
export function PdfAcrobatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="pdfIconFold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF9A8C" />
          <stop offset="100%" stopColor="#FF5C4D" />
        </linearGradient>
      </defs>
      {/* Carte rouge + onglet (coin rabattu) */}
      <path
        d="M7 3C7 1.9 7.9 1 9 1h10l7 7v33c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2V3z"
        fill="#E5252A"
      />
      {/* Coin replié (triangle orangé, comme sur l’icône Adobe) */}
      <path d="M19 1h7v7L19 1z" fill="url(#pdfIconFold)" />

      {/* Ruban blanc façon logo Acrobat (trait épais, lisible en petit) */}
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="2.05"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.8 15.2c1-2.6 3.8-3.5 5.8-2.1 1.2.9 1.4 2.6.5 3.9-.6.9-1.6 1.4-2.6 1.3.9.4 2 .2 2.7-.5.9-1 1-2.5.2-3.5-.8-1-2.4-1.1-3.4-.2-1.2.6-2 1.5-2.3"
      />

      <text
        x="18"
        y="38.5"
        textAnchor="middle"
        fill="#fff"
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "0.06em",
        }}
      >
        PDF
      </text>
    </svg>
  );
}
