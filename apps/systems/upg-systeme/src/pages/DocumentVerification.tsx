import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import jsQR from 'jsqr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScanLine, ShieldCheck, ShieldX, Camera, CameraOff, House } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type VerificationResult = {
  known: boolean;
  message: string;
  detectedType?: 'student_card' | 'transcript' | 'payment_receipt' | 'unknown';
  student?: {
    id: string;
    matricule: string | null;
    nom: string;
    postnom: string;
    prenom: string;
    domaine: string;
    filiere: string;
    promotion: string;
    annee_academique: string;
    status?: string;
  };
  checks?: Array<{ label: string; ok: boolean; detail: string }>;
};

type DocumentPayload = {
  version?: number;
  document_type?: string;
  student_id?: string;
  matricule?: string;
  full_name?: string;
  academic_year?: string;
  issued_at?: string;
  nom?: string;
  payment_id?: string;
  amount?: number;
  date?: string;
  codification?: string;
  doc_ref?: string;
};

const normalize = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const namesMatch = (payloadName: string, dbName: string) => {
  const a = normalize(payloadName);
  const b = normalize(dbName);
  if (!a || !b) return true;
  if (a === b) return true;

  const tokensA = a.split(' ').filter(Boolean);
  const tokensB = b.split(' ').filter(Boolean);
  const common = tokensA.filter(t => tokensB.includes(t));
  return common.length >= Math.min(tokensA.length, tokensB.length);
};

const getStatusLabel = (status?: string, known?: boolean) => {
  const normalized = (status || '').trim().toLowerCase();
  if (normalized === 'approved') return 'Approuvé(e)';
  if (normalized === 'pending') return 'En attente';
  if (normalized === 'rejected') return 'Rejeté(e)';
  // En mode public, si le document est confirmé mais que le champ status n'est pas renvoyé.
  if (known) return 'Approuvé(e)';
  return '—';
};

export default function DocumentVerification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(user);
  const [qrText, setQrText] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'starting' | 'active' | 'detected' | 'stopped' | 'error'>('idle');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopScanner = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setScanStatus('stopped');
  };

  const waitForVideoReady = async (video: HTMLVideoElement) => {
    if (video.readyState >= 2 && video.videoWidth > 0) return;
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error('VIDEO_NOT_READY'));
      }, 4000);

      const onReady = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        window.clearTimeout(timeout);
        video.removeEventListener('loadedmetadata', onReady);
        video.removeEventListener('canplay', onReady);
      };

      video.addEventListener('loadedmetadata', onReady);
      video.addEventListener('canplay', onReady);
    });
  };

  const runDetectionLoop = async (detector: any | null) => {
    if (!videoRef.current) return;
    try {
      if (detector) {
        const codes = await detector.detect(videoRef.current);
        if (codes?.length) {
          const raw = codes[0]?.rawValue;
          if (raw) {
            setQrText(raw);
            setScanStatus('detected');
            stopScanner();
            toast.success('QR code détecté.');
          }
        }
      } else if (canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const width = video.videoWidth || 0;
        const height = video.videoHeight || 0;
        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            const code = jsQR(imageData.data, width, height);
            if (code?.data) {
              setQrText(code.data);
              setScanStatus('detected');
              stopScanner();
              toast.success('QR code détecté.');
            }
          }
        }
      }
    } catch {
      // Ignore les erreurs transitoires de lecture caméra.
    }
    rafRef.current = requestAnimationFrame(() => {
      void runDetectionLoop(detector);
    });
  };

  const startScanner = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Caméra non prise en charge sur ce navigateur.');
      return;
    }
    const BarcodeDetectorCtor = (window as any).BarcodeDetector;
    setScanStatus('starting');

    const videoConstraints: MediaTrackConstraints[] = [
      { facingMode: { ideal: 'environment' } },
      { facingMode: 'user' },
      true as unknown as MediaTrackConstraints,
    ];

    try {
      let stream: MediaStream | null = null;
      for (const constraint of videoConstraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: constraint });
          if (stream) break;
        } catch {
          // On tente la contrainte suivante (avant -> arrière -> défaut).
        }
      }
      if (!stream) throw new Error('NO_CAMERA_STREAM');

      streamRef.current = stream;
      setIsScanning(true);
      setScanStatus('active');

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      await videoRef.current.play();
      await waitForVideoReady(videoRef.current);

      const detector = BarcodeDetectorCtor
        ? new BarcodeDetectorCtor({ formats: ['qr_code'] })
        : null;
      void runDetectionLoop(detector);
    } catch (err) {
      stopScanner();
      setScanStatus('error');
      toast.error("Impossible d'activer la caméra.");
      console.error('[DocumentVerification] camera start failed:', err);
    }
  };

  const statusView: Record<typeof scanStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    idle: { label: 'Caméra inactive', variant: 'secondary' },
    starting: { label: 'Démarrage de la caméra...', variant: 'secondary' },
    active: { label: 'Caméra active - En attente de QR', variant: 'default' },
    detected: { label: 'QR détecté', variant: 'default' },
    stopped: { label: 'Scan arrêté', variant: 'secondary' },
    error: { label: 'Erreur caméra', variant: 'destructive' },
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const parsePayload = (raw: string): DocumentPayload | null => {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed) return parsed as DocumentPayload;
      return null;
    } catch {
      return null;
    }
  };

  const inferDocumentType = (payload: DocumentPayload): 'student_card' | 'transcript' | 'payment_receipt' | 'unknown' => {
    if (payload.document_type === 'student_card' || payload.document_type === 'transcript' || payload.document_type === 'payment_receipt') {
      return payload.document_type;
    }
    if (payload.payment_id || (payload.doc_ref || '').startsWith('payment_receipt:')) return 'payment_receipt';
    if (payload.codification || (payload.doc_ref || '').startsWith('transcript:')) return 'transcript';
    if (payload.student_id || payload.matricule) return 'student_card';
    return 'unknown';
  };

  const logVerification = async (params: {
    raw: string;
    payload?: DocumentPayload | null;
    documentType?: string;
    result: VerificationResult;
  }) => {
    if (!user?.id) return;
    const { raw, payload, result, documentType } = params;
    const { error } = await supabase.from('document_verification_logs').insert({
      verifier_user_id: user.id,
      document_type: documentType || payload?.document_type || 'unknown',
      student_id: result.student?.id ?? null,
      qr_raw: raw,
      is_known: result.known,
      message: result.message,
      checks: result.checks ?? [],
    });
    if (error) {
      console.error('[DocumentVerification] failed to log verification:', error);
    }
  };

  const fetchPublicStudent = async (studentId?: string, matricule?: string) => {
    const { data, error } = await supabase.rpc(
      'verify_student_document_public' as any,
      {
        p_student_id: studentId || null,
        p_matricule: matricule || null,
      } as any
    );

    if (error) return { data: null, error };
    const row = Array.isArray(data) ? data[0] : data;
    return { data: row ?? null, error: null };
  };

  const verifyDocument = async () => {
    const raw = qrText.trim();
    if (!raw) {
      toast.error('Scannez ou collez un QR code avant de vérifier.');
      return;
    }

    setVerifying(true);
    setResult(null);

    const payload = parsePayload(raw);
    if (!payload) {
      setVerifying(false);
      const verificationResult = {
        known: false,
        message: 'QR non reconnu par le système (format invalide).',
        detectedType: 'unknown' as const,
      };
      setResult(verificationResult);
      await logVerification({ raw, payload: null, result: verificationResult });
      return;
    }

    const documentType = inferDocumentType(payload);

    if (documentType === 'payment_receipt') {
      const paymentId = payload.payment_id?.trim();
      if (!paymentId) {
        setVerifying(false);
        const verificationResult = {
          known: false,
          message: 'QR reçu de paiement sans payment_id exploitable.',
          detectedType: documentType,
        };
        setResult(verificationResult);
        await logVerification({ raw, payload, documentType, result: verificationResult });
        return;
      }

      const paymentQuery = isAuthenticated
        ? supabase
            .from('payments')
            .select('id, montant, date, student:students(id, matricule, nom, postnom, prenom, domaine, filiere, promotion, annee_academique, status)')
            .eq('id', paymentId)
            .maybeSingle()
        : supabase
            .from('payments')
            .select('id, montant, date, student:students(id, matricule, nom, postnom, prenom, domaine, filiere, promotion, annee_academique)')
            .eq('id', paymentId)
            .maybeSingle();

      const { data: payment, error } = await paymentQuery;
      setVerifying(false);

      if (error || !payment || !payment.student) {
        const verificationResult = {
          known: false,
          message: 'Reçu inconnu du système.',
          detectedType: documentType,
        };
        setResult(verificationResult);
        await logVerification({ raw, payload, documentType, result: verificationResult });
        return;
      }

      const checks = [
        { label: 'Type de document', ok: true, detail: 'payment_receipt' },
        {
          label: 'Montant',
          ok: payload.amount === undefined || Number(payload.amount) === Number((payment as any).montant),
          detail: `${payload.amount ?? '—'} / ${(payment as any).montant}`,
        },
        {
          label: 'Date',
          ok: !payload.date || payload.date === (payment as any).date,
          detail: `${payload.date || '—'} / ${(payment as any).date}`,
        },
      ];
      const allOk = checks.every(c => c.ok);
      const verificationResult = {
        known: allOk,
        message: allOk
          ? 'Reçu connu et cohérent avec les données système.'
          : 'Reçu connu mais des incohérences ont été détectées.',
        detectedType: documentType,
        student: (payment as any).student,
        checks,
      };
      setResult(verificationResult);
      await logVerification({ raw, payload, documentType, result: verificationResult });
      return;
    }

    const lookupById = payload.student_id?.trim();
    const lookupByMatricule = payload.matricule?.trim();
    if (!lookupById && !lookupByMatricule) {
      setVerifying(false);
      const verificationResult = {
        known: false,
        message: 'QR valide mais sans identifiant exploitable.',
        detectedType: documentType,
      };
      setResult(verificationResult);
      await logVerification({ raw, payload, documentType, result: verificationResult });
      return;
    }

    let data: any = null;
    let error: any = null;

    if (isAuthenticated) {
      const baseQuery = supabase
        .from('students')
        .select('id, matricule, nom, postnom, prenom, domaine, filiere, promotion, annee_academique, status')
        .limit(1);

      // Priorité à student_id, puis fallback matricule pour éviter les faux négatifs.
      if (lookupById) {
        const byId = await baseQuery.eq('id', lookupById).maybeSingle();
        data = byId.data;
        error = byId.error;
        if (!data && lookupByMatricule) {
          const byMatricule = await baseQuery.eq('matricule', lookupByMatricule).maybeSingle();
          data = byMatricule.data;
          error = byMatricule.error;
        }
      } else {
        const byMatricule = await baseQuery.eq('matricule', lookupByMatricule as string).maybeSingle();
        data = byMatricule.data;
        error = byMatricule.error;
      }
    } else {
      // En mode public, on passe par une fonction SQL dédiée qui n'expose que les champs autorisés.
      const publicLookup = await fetchPublicStudent(lookupById, lookupByMatricule || undefined);
      data = publicLookup.data;
      error = publicLookup.error;
    }
    setVerifying(false);

    if (error) {
      const verificationResult = {
        known: false,
        message: 'Erreur de vérification. Veuillez réessayer.',
        detectedType: documentType,
      };
      setResult(verificationResult);
      await logVerification({ raw, payload, documentType, result: verificationResult });
      return;
    }

    if (!data) {
      const verificationResult = {
        known: false,
        message: 'Document inconnu du système.',
        detectedType: documentType,
      };
      setResult(verificationResult);
      await logVerification({ raw, payload, documentType, result: verificationResult });
      return;
    }

    const fullNameDb = `${data.nom} ${data.postnom} ${data.prenom}`.trim();
    const fullNamePayload = payload.full_name || payload.nom || '';
    const checks = [
      {
        label: 'Type de document',
        ok: documentType !== 'unknown',
        detail: documentType === 'unknown' ? 'non reconnu' : documentType,
      },
      {
        label: 'Matricule',
        ok: !payload.matricule || payload.matricule === data.matricule,
        detail: `${payload.matricule || '—'} / ${data.matricule || '—'}`,
      },
      {
        label: 'Nom complet',
        ok: !fullNamePayload || namesMatch(fullNamePayload, fullNameDb),
        detail: `${fullNamePayload || '—'} / ${fullNameDb}`,
      },
      {
        label: 'Année académique',
        ok: !payload.academic_year || payload.academic_year === data.annee_academique,
        detail: `${payload.academic_year || '—'} / ${data.annee_academique}`,
      },
    ];

    const allOk = checks.every(c => c.ok);
    const label = documentType === 'transcript' ? 'Relevé' : 'Document';
    const verificationResult = {
      known: allOk,
      message: allOk
        ? (isAuthenticated
            ? `${label} connu et cohérent avec les données système.`
            : `${label} authentique et reconnu dans le système.`)
        : `${label} connu mais des incohérences ont été détectées.`,
      detectedType: documentType,
      student: data,
      checks,
    };
    setResult(verificationResult);
    await logVerification({ raw, payload, documentType, result: verificationResult });
  };

  return (
    <div className="min-h-screen w-full bg-muted/20 p-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl flex-col justify-center space-y-4 pb-24">
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Vérification d'authenticité des documents
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cliquer sur Scanner via caméra puis scanner le QR code de document.
            {' '}Ou Scannez le code QR de document avec un scanneur de votre téléphone et copier ici les identifiants dans la ligne de saisie en bas.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {!isScanning ? (
              <Button type="button" variant="outline" onClick={() => void startScanner()}>
                <Camera className="h-4 w-4 mr-2" />
                Scanner via caméra
              </Button>
            ) : (
              <Button type="button" variant="destructive" onClick={stopScanner}>
                <CameraOff className="h-4 w-4 mr-2" />
                Arrêter le scan
              </Button>
            )}
            <Button type="button" onClick={() => void verifyDocument()} disabled={verifying}>
              Vérifier le document
            </Button>
            <Badge variant={statusView[scanStatus].variant}>
              {statusView[scanStatus].label}
            </Badge>
          </div>

          {isScanning && (
            <div className="rounded-md border p-3 bg-secondary/30">
              <video ref={videoRef} className="w-full rounded-md max-h-72 object-cover bg-black/5" muted playsInline autoPlay />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Scannez le code QR de document avec un scanneur de votre téléphone et copier ici les identifiants dans la ligne de saisie en bas.</Label>
            <Input
              value={qrText}
              onChange={e => setQrText(e.target.value)}
              placeholder='Ex: {"document_type":"student_card","student_id":"..."}'
            />
          </div>
        </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.known ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <span>Authenticité confirmée</span>
                  </>
                ) : (
                  <>
                    <ShieldX className="h-5 w-5 text-destructive" />
                    <span>Authenticité non confirmée</span>
                  </>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{result.message}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border p-3 text-sm bg-secondary/30">
                <strong>Type détecté :</strong>{' '}
                {result.detectedType === 'student_card'
                  ? 'Carte étudiant'
                  : result.detectedType === 'transcript'
                    ? 'Relevé de cotes'
                    : result.detectedType === 'payment_receipt'
                      ? 'Reçu de paiement'
                      : 'Inconnu'}
              </div>

              {result.student && (
                <div className="rounded-md border p-3 text-sm">
                  <p><strong>Étudiant:</strong> {result.student.nom} {result.student.postnom} {result.student.prenom}</p>
                  <p><strong>Matricule:</strong> {result.student.matricule || '—'}</p>
                  <p><strong>Filière:</strong> {result.student.domaine} — {result.student.filiere} ({result.student.promotion})</p>
                  <p><strong>Année académique:</strong> {result.student.annee_academique}</p>
                  <p><strong>Statut:</strong> {getStatusLabel(result.student.status, result.known)}</p>
                </div>
              )}

              {result.checks?.length ? (
                <div className="space-y-2">
                  {result.checks.map(check => (
                    <div key={check.label} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <span>{check.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{check.detail}</span>
                        <Badge variant={check.ok ? 'default' : 'destructive'}>
                          {check.ok ? 'OK' : 'Échec'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

      </div>
      <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
        <Button asChild className="h-12 rounded-full px-6 text-sm font-semibold shadow-2xl" title="Revenir à l'accueil">
          <a href="/" target="_top" rel="noopener noreferrer" aria-label="Revenir à l'accueil">
            <House className="mr-2 h-5 w-5" />
            Revenir à l&apos;accueil
          </a>
        </Button>
      </div>
    </div>
  );
}
