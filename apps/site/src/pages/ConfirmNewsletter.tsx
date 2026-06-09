import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConfirmNewsletter = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    const confirm = async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .update({ confirmed: true, confirmed_at: new Date().toISOString() })
        .eq("confirmation_token", token)
        .eq("confirmed", false)
        .select("id")
        .maybeSingle();

      if (error) {
        setStatus("error");
        return;
      }

      if (data) {
        setStatus("success");
        return;
      }

      // Lien potentiellement déjà "consommé" (pré-ouverture automatique par client mail/antispam).
      // Dans ce cas, si le token existe déjà avec confirmed=true, on affiche succès.
      const { data: existing, error: readError } = await supabase
        .from("newsletter_subscribers")
        .select("id, confirmed")
        .eq("confirmation_token", token)
        .maybeSingle();

      if (!readError && existing?.confirmed) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    };

    confirm();
  }, [params]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">Confirmation en cours...</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h1 className="text-2xl font-bold">Inscription confirmée !</h1>
              <p className="text-muted-foreground">
                Merci ! Votre adresse email a été confirmée. Vous recevrez désormais nos actualités.
              </p>
              <Button asChild className="mt-4">
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-16 h-16 text-destructive" />
              <h1 className="text-2xl font-bold">Lien invalide</h1>
              <p className="text-muted-foreground">
                Ce lien de confirmation est invalide ou a déjà été utilisé.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmNewsletter;
