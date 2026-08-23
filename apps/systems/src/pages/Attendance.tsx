import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { laravelApi } from '@/services/laravelApi';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, QrCode, CheckCircle2, XCircle, ClipboardCheck, Clock } from 'lucide-react';

const SESSION_TYPES = [
  { value: 'tp', label: 'TP / Laboratoire' },
  { value: 'cours', label: 'Cours théorique' },
];

interface AttendanceRecord {
  id?: string;
  student_id: string;
  course_id: string;
  session_type: string;
  session_date: string;
  status: 'present' | 'absent';
  arrival_time?: string | null;
  departure_time?: string | null;
  qr_code?: string | null;
  validated_by?: string | null;
  created_at?: string | null;
}

export default function Attendance() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sessionType, setSessionType] = useState('tp');
  const [sessionDate, setSessionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [qrStudent, setQrStudent] = useState<Student | null>(null);
  const [codeToValidate, setCodeToValidate] = useState('');
  const [loading, setLoading] = useState(false);

  const sessionKey = useMemo(
    () => `${selectedCourse}:${sessionType}:${sessionDate}`,
    [selectedCourse, sessionType, sessionDate]
  );

  const loadCourses = async () => {
    try {
      const data = await laravelApi.getCourses();
      setCourses((data as Course[]) || []);
    } catch (error) {
      toast.error('Impossible de charger les cours');
      console.error('Error loading courses:', error);
    }
  };

  const loadStudents = async () => {
    if (!selectedCourse) {
      setStudents([]);
      setAttendance({});
      return;
    }

    const course = courses.find((c) => c.id === selectedCourse);
    if (!course) {
      setStudents([]);
      setAttendance({});
      return;
    }

    try {
      // Charger les étudiants filtrés par filière et promotion
      const studs = await laravelApi.getStudents({
        status: 'approved',
        filiere: course.filiere,
        promotion: course.promotion,
      });
      setStudents((studs as Student[]) || []);

      // Charger les présences existantes
      const records = await laravelApi.getCourseAttendance(selectedCourse, {
        session_type: sessionType,
        session_date: sessionDate,
      });

      const map: Record<string, AttendanceRecord> = {};
      (records as AttendanceRecord[] || []).forEach((record) => {
        map[record.student_id] = record;
      });

      setAttendance(map);
      setAttendanceError(null);
    } catch (error) {
      toast.error('Impossible de charger les données');
      console.error('Error loading students:', error);
      setAttendanceError('Erreur lors du chargement des données. Vérifiez la connexion API.');
      setAttendance({});
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [selectedCourse, sessionType, sessionDate, courses]);

  const changeStatus = (studentId: string, status: 'present' | 'absent') => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {
          student_id: studentId,
          course_id: selectedCourse,
          session_type: sessionType,
          session_date: sessionDate,
          status,
        }),
        status,
        course_id: selectedCourse,
        session_type: sessionType,
        session_date: sessionDate,
      },
    }));
  };

  const saveAttendance = async () => {
    if (!selectedCourse) {
      toast.error('Sélectionnez un cours.');
      return;
    }

    setLoading(true);
    const payload = Object.values(attendance).map((record) => ({
      ...record,
      validated_by: user?.id || null,
    }));

    try {
      await laravelApi.bulkCreateAttendance(payload);
      toast.success('Présences enregistrées');
      loadStudents();
    } catch (error) {
      toast.error('Impossible d\'enregistrer la présence.');
      console.error('Error saving attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildQrCodeValue = (studentId: string) =>
    `attendance:${selectedCourse}:${studentId}:${sessionType}:${sessionDate}`;

  const validateQrCode = async () => {
    if (!codeToValidate || !selectedCourse) {
      toast.error('Entrez un code QR et sélectionnez un cours.');
      return;
    }

    const parts = codeToValidate.split(':');
    if (parts.length !== 5 || parts[0] !== 'attendance') {
      toast.error('Code QR invalide');
      return;
    }

    const [_, courseId, studentId, codeSessionType, codeDate] = parts;
    if (courseId !== selectedCourse || codeSessionType !== sessionType || codeDate !== sessionDate) {
      toast.error('Ce QR ne correspond pas à la session sélectionnée.');
      return;
    }

    changeStatus(studentId, 'present');
    setCodeToValidate('');
    toast.success('Présence validée');
  };

  const downloadInterrogationList = () => {
    if (!selectedCourse) {
      toast.error('Sélectionnez un cours pour télécharger la liste.');
      return;
    }

    const rows = [
      ['Matricule', 'Nom complet', 'Filière', 'Promotion', 'Présence'],
      ...students.map((student) => [
        student.matricule || '',
        `${student.nom} ${student.postnom} ${student.prenom}`,
        student.filiere,
        student.promotion,
        attendance[student.id]?.status === 'present' ? 'Présent' : 'Absent',
      ]),
    ];

    const csv = rows.map((row) => row.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `liste-interrogation-${selectedCourse}-${sessionDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-4 md:grid-cols-3 flex-1">
          <div>
            <Label>Cours</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger><SelectValue placeholder="Choisir un cours" /></SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} â€” {course.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Type de session</Label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date de la séance</Label>
            <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:w-72">
          <Button variant="secondary" onClick={downloadInterrogationList} className="w-full">
            <Download className="h-4 w-4 mr-2" /> Télécharger la liste d'interrogation
          </Button>
          <Button onClick={saveAttendance} disabled={!selectedCourse || loading} className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" /> Enregistrer les présences
          </Button>
        </div>
      </div>

      {attendanceError ? (
        <Card className="border border-destructive/20 bg-destructive/5">
          <CardContent>
            <p className="text-destructive">{attendanceError}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Validation QR et présences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Code QR de validation</Label>
                <Input
                  value={codeToValidate}
                  onChange={(e) => setCodeToValidate(e.target.value)}
                  placeholder="Collez le code QR ici"
                />
              </div>
              <Button onClick={validateQrCode} className="self-end md:self-auto">
                <QrCode className="h-4 w-4 mr-2" /> Valider le code QR
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Pour les TP et laboratoires, chaque étudiant utilise le QR de sa carte ou la chaîne de validation correspondante.
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Liste des étudiants</CardTitle>
              <p className="text-sm text-muted-foreground">
                {students.length} étudiant{students.length > 1 ? 's' : ''} pour ce cours
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Session: {SESSION_TYPES.find((t) => t.value === sessionType)?.label}</Badge>
              <Badge variant="outline">Date: {format(new Date(sessionDate), 'dd/MM/yyyy')}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Filière</TableHead>
                <TableHead>Présence</TableHead>
                <TableHead>Arrivée</TableHead>
                <TableHead>Départ</TableHead>
                <TableHead>QR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const record = attendance[student.id];
                const status = record?.status || 'absent';
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm">{student.matricule || 'â€”'}</TableCell>
                    <TableCell>{student.nom} {student.postnom} {student.prenom}</TableCell>
                    <TableCell>{student.filiere}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={status === 'present' ? 'default' : 'outline'}
                          onClick={() => changeStatus(student.id, 'present')}
                        >
                          Présent
                        </Button>
                        <Button
                          size="sm"
                          variant={status === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => changeStatus(student.id, 'absent')}
                        >
                          Absent
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        className="w-24 text-sm"
                        value={record?.arrival_time || ''}
                        onChange={(e) => {
                          setAttendance((prev) => ({
                            ...prev,
                            [student.id]: {
                              ...(prev[student.id] || {
                                student_id: student.id,
                                course_id: selectedCourse,
                                session_type: sessionType,
                                session_date: sessionDate,
                                status: status || 'absent',
                              }),
                              arrival_time: e.target.value as string,
                            },
                          }));
                        }}
                        disabled={status !== 'present'}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        className="w-24 text-sm"
                        value={record?.departure_time || ''}
                        onChange={(e) => {
                          setAttendance((prev) => ({
                            ...prev,
                            [student.id]: {
                              ...(prev[student.id] || {
                                student_id: student.id,
                                course_id: selectedCourse,
                                session_type: sessionType,
                                session_date: sessionDate,
                                status: status || 'absent',
                              }),
                              departure_time: e.target.value as string,
                            },
                          }));
                        }}
                        disabled={status !== 'present'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="secondary" onClick={() => setQrStudent(student)}>
                        <QrCode className="h-4 w-4 mr-2" /> QR
                      </Button>
                      <Dialog open={!!qrStudent} onOpenChange={(open) => { if (!open) setQrStudent(null); }}>
                        <DialogContent className="max-w-sm">
                          <DialogHeader>
                            <DialogTitle>QRCode de {qrStudent?.nom}</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center gap-4 py-4">
                            <QRCodeSVG value={qrStudent ? buildQrCodeValue(qrStudent.id) : ''} size={180} />
                            <div className="text-xs text-muted-foreground break-all text-center">
                              {qrStudent ? buildQrCodeValue(qrStudent.id) : ''}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Sélectionnez un cours pour afficher les étudiants.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guide de présence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✓ Utilisez les codes QR pour les séances pratiques et les laboratoires.</p>
          <p>✓ Enregistrez un code QR dans l'interface ou utilisez la validation manuelle.</p>
          <p>✓ Téléchargez la liste d'interrogation en CSV pour l'impression ou l'archivage.</p>
        </CardContent>
      </Card>
    </div>
  );
}
