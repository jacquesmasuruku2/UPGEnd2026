import { useCallback } from "react";
import { Copy, Facebook, Linkedin, Share2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  title: string;
  url: string;
  className?: string;
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback ci-dessous */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Logo officiel WhatsApp (marque) — SVG monochrome sur fond vert */
const WhatsAppBrandIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
    />
  </svg>
);

/**
 * Partage WhatsApp, Facebook, LinkedIn (URL + titre encodés).
 */
const SocialShareButtons = ({ title, url, className = "" }: Props) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = useCallback(async () => {
    const ok = await copyTextToClipboard(url);
    if (ok) {
      toast.success("Lien copié dans le presse-papiers");
    } else {
      toast.error("Impossible de copier le lien");
    }
  }, [url]);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground flex items-center gap-1 shrink-0">
        <Share2 className="w-4 h-4" /> Partager :
      </span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur Facebook"
        className="p-2 rounded-full bg-[hsl(221,44%,41%)] text-white hover:opacity-85 transition-opacity"
      >
        <Facebook className="w-4 h-4" />
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur WhatsApp"
        className="p-2 rounded-full bg-[#25D366] text-white shadow-sm hover:bg-[#20BD5A] transition-colors"
      >
        <WhatsAppBrandIcon className="w-[18px] h-[18px]" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur LinkedIn"
        className="p-2 rounded-full bg-[hsl(210,80%,40%)] text-white hover:opacity-85 transition-opacity"
      >
        <Linkedin className="w-4 h-4" />
      </a>
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label="Copier le lien de la publication"
        title="Copier le lien"
        className="p-2 rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SocialShareButtons;
