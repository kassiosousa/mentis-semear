import { MessageSquareHeart } from 'lucide-react';
import { useState } from 'react';
import { thermometerLinkOf } from '@/domain/company/entities/Company';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { QrCodeDialog, type QrTarget } from '@/presentation/components/ui/qr-code-dialog';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { WorkshopLinkRow } from '@/presentation/components/workshop/WorkshopLinkRow';
import { useCompany } from '@/presentation/hooks/useCompanies';

interface ThermometerSector {
  id: number;
  name: string;
}

interface ThermometerLinkCardProps {
  companyId: number | undefined;
  sector?: ThermometerSector;
}

function linkWithSector(link: string, sectorId: number): string {
  return `${link}${link.includes('?') ? '&' : '?'}setor=${sectorId}`;
}

export function ThermometerLinkCard({ companyId, sector }: ThermometerLinkCardProps) {
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);

  const company = useCompany(companyId);
  const companyLink =
    company.data === undefined ? null : thermometerLinkOf(company.data, window.location.origin);

  const loading = companyId !== undefined && company.isPending;
  const companyName = company.data?.name ?? '';
  const link =
    companyLink === null || sector === undefined
      ? companyLink
      : linkWithSector(companyLink, sector.id);
  const label =
    sector === undefined ? 'Termômetro da empresa' : `Termômetro do setor ${sector.name}`;

  const showQr = () => {
    if (link === null) return;

    setQrTarget({
      title: `QR Code — ${label}`,
      description:
        sector === undefined
          ? `${companyName}. Aponte a câmera para responder.`
          : `${companyName} · setor ${sector.name}. Aponte a câmera para responder.`,
      url: link,
      fileName:
        sector === undefined
          ? `termometro-${company.data?.id ?? ''}`
          : `termometro-setor-${sector.id}`,
    });
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageSquareHeart className="size-4 text-primary" />
          {sector === undefined ? 'Termômetro emocional' : 'Link do termômetro'}
        </CardTitle>
        <CardDescription>
          {sector === undefined
            ? 'Compartilhe o link com a equipe: cada pessoa escolhe o próprio setor e responde de forma anônima.'
            : `Compartilhe com a equipe do setor: o formulário abre com ${sector.name} já selecionado e a resposta continua anônima.`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading && <Skeleton className="h-16 w-full" />}

        {!loading && link === null && (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
            O link ainda não está disponível para este acesso. Fale com o administrador do
            programa.
          </p>
        )}

        {link !== null && <WorkshopLinkRow label={label} url={link} onShowQr={showQr} />}
      </CardContent>

      <QrCodeDialog
        target={qrTarget}
        onOpenChange={(open) => {
          if (!open) setQrTarget(null);
        }}
      />
    </Card>
  );
}
