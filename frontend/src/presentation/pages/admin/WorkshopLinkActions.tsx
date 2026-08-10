import { Copy, ExternalLink, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';

const QR_SIZE = 224;
const TOAST_ID = 'workshop-link';

interface WorkshopLinkActionsProps {
  label: string;
  description: string;
  url: string | null;
}

async function copyToClipboard(url: string): Promise<boolean> {
  if (navigator.clipboard !== undefined) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export function WorkshopLinkActions({ label, description, url }: WorkshopLinkActionsProps) {
  const [qrOpen, setQrOpen] = useState(false);

  const copy = () => {
    if (url === null) return;

    void copyToClipboard(url).then((copied) => {
      if (copied) {
        toast.success('Link copiado.', { id: TOAST_ID });
        return;
      }

      toast.error('Não foi possível copiar. Copie o link manualmente.', { id: TOAST_ID });
    });
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-title">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {url === null ? (
        <p className="text-sm text-muted-foreground">Link não cadastrado.</p>
      ) : (
        <>
          <p
            className="min-w-0 truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs text-muted-foreground"
            title={url}
          >
            {url}
          </p>

          <div className="grid gap-2 min-[420px]:grid-cols-3">
            <Button variant="outline" size="sm" onClick={() => setQrOpen(true)} className="w-full">
              <QrCode className="size-4" />
              QR Code
            </Button>

            <Button variant="outline" size="sm" onClick={copy} className="w-full">
              <Copy className="size-4" />
              Copiar
            </Button>

            <Button variant="outline" size="sm" asChild className="w-full">
              <a href={url} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Abrir
              </a>
            </Button>
          </div>

          <Dialog open={qrOpen} onOpenChange={setQrOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>{label}</DialogTitle>
                <DialogDescription>
                  Aponte a câmera do celular para o código abaixo.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center gap-3">
                <div className="rounded-xl bg-white p-4">
                  <QRCodeSVG
                    value={url}
                    size={QR_SIZE}
                    level="M"
                    bgColor="#FFFFFF"
                    fgColor="#14261A"
                  />
                </div>

                <p className="w-full text-center font-mono text-xs break-all text-muted-foreground">
                  {url}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
