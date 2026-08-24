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

  if (companyLink === null) return null;

  const companyName = company.data?.name ?? '';
  const link = sector === undefined ? companyLink : linkWithSector(companyLink, sector.id);
  const label =
    sector === undefined ? 'Termômetro da empresa' : `Termômetro do setor ${sector.name}`;

  const showQr = () => {
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
        <WorkshopLinkRow label={label} url={link} onShowQr={showQr} />
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
