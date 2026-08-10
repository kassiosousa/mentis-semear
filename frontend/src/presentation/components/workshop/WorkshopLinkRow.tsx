import { Copy, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/clipboard';
import { Button } from '@/presentation/components/ui/button';

interface WorkshopLinkRowProps {
  label: string;
  url: string;
  onShowQr: () => void;
  compact?: boolean;
}

export function WorkshopLinkRow({ label, url, onShowQr, compact = false }: WorkshopLinkRowProps) {
  const onCopy = async () => {
    const copied = await copyToClipboard(url);

    if (copied) {
      toast.success(`Link de ${label.toLowerCase()} copiado.`, { id: 'workshop-link-copy' });
      return;
    }

    toast.error('Não foi possível copiar o link.', { id: 'workshop-link-copy' });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onCopy}
          title={`Copiar link de ${label.toLowerCase()}`}
          aria-label={`Copiar link de ${label.toLowerCase()}`}
        >
          <Copy className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onShowQr}
          title={`QR Code de ${label.toLowerCase()}`}
          aria-label={`QR Code de ${label.toLowerCase()}`}
        >
          <QrCode className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-title">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{url}</p>
      </div>

      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="size-3.5" />
          Copiar
        </Button>
        <Button variant="outline" size="sm" onClick={onShowQr}>
          <QrCode className="size-3.5" />
          QR Code
        </Button>
        <Button variant="ghost" size="icon-sm" asChild title="Abrir link">
          <a href={url} target="_blank" rel="noreferrer" aria-label={`Abrir ${label}`}>
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
