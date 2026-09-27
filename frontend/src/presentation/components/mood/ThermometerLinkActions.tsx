import { Copy, ExternalLink, MessageSquareHeart, QrCode } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { thermometerLinkOf } from '@/domain/company/entities/Company';
import { copyToClipboard } from '@/lib/clipboard';
import { Button } from '@/presentation/components/ui/button';
import { QrCodeDialog, type QrTarget } from '@/presentation/components/ui/qr-code-dialog';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useCompany } from '@/presentation/hooks/useCompanies';

interface ThermometerLinkActionsProps {
  companyId: number | undefined;
}

export function ThermometerLinkActions({ companyId }: ThermometerLinkActionsProps) {
  const [expanded, setExpanded] = useState(false);
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);

  const company = useCompany(companyId);
  const link =
    company.data === undefined ? null : thermometerLinkOf(company.data, window.location.origin);

  if (companyId !== undefined && company.isPending) {
    return <Skeleton className="h-9 w-40 rounded-lg" />;
  }

  if (link === null) {
    return (
      <p className="text-xs text-muted-foreground">
        O link de avaliação ainda não está disponível para este acesso. Fale com o administrador
        do programa.
      </p>
    );
  }

  const onCopy = async () => {
    const copied = await copyToClipboard(link);

    if (copied) {
      toast.success('Link de avaliação copiado.', { id: 'thermometer-link-copy' });
      return;
    }

    toast.error('Não foi possível copiar o link.', { id: 'thermometer-link-copy' });
  };

  const showQr = () => {
    setQrTarget({
      title: 'QR Code — Avaliar setor',
      description: `${company.data?.name ?? ''}. Aponte a câmera para responder ao termômetro.`,
      url: link,
      fileName: `termometro-${company.data?.id ?? ''}`,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="lg"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-label="Avaliar setor"
      >
        <MessageSquareHeart className="size-4" />
        Avaliar setor
      </Button>

      {expanded && (
        <div className="flex animate-in items-center gap-1.5 duration-200 fade-in slide-in-from-left-2">
          <Button
            variant="outline"
            size="icon-lg"
            onClick={showQr}
            title="QR Code do link de avaliação"
            aria-label="QR Code do link de avaliação"
          >
            <QrCode className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="icon-lg"
            onClick={onCopy}
            title="Copiar link de avaliação"
            aria-label="Copiar link de avaliação"
          >
            <Copy className="size-4" />
          </Button>

          <Button variant="outline" size="icon-lg" asChild title="Abrir link de avaliação">
            <a href={link} target="_blank" rel="noreferrer" aria-label="Abrir link de avaliação">
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      )}

      <QrCodeDialog
        target={qrTarget}
        onOpenChange={(open) => {
          if (!open) setQrTarget(null);
        }}
      />
    </div>
  );
}
