import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, Student } from '@/types';

interface AuthUser {
  id: string;
  email: string;
  nom: string;
  role: UserRole;
  studentData?: Student;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<string | null>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (newPassword: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const getResetRedirectUrl = () => {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}#/reinitialiser-mot-de-passe`;
  };

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (userId: string, email: string) => {
    try {
      // Check user role
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', userId);
      const role = roles?.[0]?.role as UserRole | undefined;

      // Check if student
      const { data: student } = await supabase.from('students').select('*').eq('user_id', userId).eq('status', 'approved').maybeSingle();

      const { data: profile } = await supabase.from('profiles').select('nom').eq('id', userId).maybeSingle();

      if (student) {
        setUser({
          id: userId,
          email,
          nom: `${student.nom} ${student.postnom}`,
          role: 'etudiant',
          studentData: student as Student
        });
      } else if (role) {
        setUser({
          id: userId,
          email,
          nom: profile?.nom || email,
          role: role
        });
      } else {
        setUser({ id: userId, email, nom: profile?.nom || email, role: 'etudiant' });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setUser({ id: userId, email, nom: email, role: 'etudiant' });
    }
  };

  useEffect(() => {
    let initialized = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to prevent Supabase auth deadlock
        setTimeout(async () => {
          await loadUserData(session.user.id, session.user.email || '');
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
      initialized = true;
    });

    // Fallback: if onAuthStateChange doesn't fire quickly
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!initialized) {
        if (session?.user) {
          loadUserData(session.user.id, session.user.email || '').then(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const requestPasswordReset = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getResetRedirectUrl(),
    });
    if (error) return error.message;
    return null;
  };

  const updatePassword = async (newPassword: string): Promise<string | null> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return error.message;
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, requestPasswordReset, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
