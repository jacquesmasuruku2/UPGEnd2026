import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import logoUpg from '@/assets/logo-upg.jpg';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const error = await requestPasswordReset(email.trim());
    setSubmitting(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Lien envoyé. Vérifiez votre boîte email.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoUpg} alt="Logo UPG" className="w-20 h-20 object-cover mx-auto mb-2 rounded-full" />
          <h1 className="text-2xl font-bold text-foreground">Réinitialisation du mot de passe</h1>
          <p className="text-muted-foreground mt-1">Système académique UPG</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">Mot de passe oublié ?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email du compte</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-11 rounded-md text-sm font-semibold tracking-wide" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Envoyer le lien de réinitialisation
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login-etudiant" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                Retour à la connexion étudiant
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
