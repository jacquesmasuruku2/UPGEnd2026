import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Chrome, Loader2 } from 'lucide-react';
import logoUpg from '@/assets/logo-upg.jpg';
import { toast } from 'sonner';

export default function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate(user.role === 'etudiant' ? '/portail' : '/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const error = await login(email, password, 'etudiant');
    setSubmitting(false);
    if (error) {
      toast.error('Identifiants incorrects. Vérifiez votre email et matricule.');
    } else {
      toast.success('Connexion réussie!');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const error = await loginWithGoogle();
    setGoogleLoading(false);
    if (error) {
      toast.error('Erreur de connexion Google: ' + error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-[400px]">
        <Card className="rounded-xl border-border/80 shadow-xl">
          <CardHeader className="text-center pb-2">
            <img
              src={logoUpg}
              alt="Logo UPG"
              className="mx-auto mb-3 h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
            />
            <CardTitle className="text-xl font-bold text-foreground">Université Polytechnique de Goma</CardTitle>
            <p className="text-sm text-muted-foreground">Portail Étudiant</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div>
                <Label>Matricule (mot de passe)</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Matricule"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-md text-sm font-semibold" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Se connecter
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={googleLoading}>
              {googleLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Chrome className="h-4 w-4 mr-2" />}
              Se connecter avec Google
            </Button>

            <a
              href="/contact"
              target="_top"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-md border border-input bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              Mot de passe oublié ?
            </a>

            <Link
              to="/inscription"
              className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              Nouvelle inscription en ligne
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

