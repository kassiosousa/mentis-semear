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

const LABEL = 'Termômetro do setor';

interface ThermometerLinkCardProps {
  companyId: number | undefined;
}

export function ThermometerLinkCard({ companyId }: ThermometerLinkCardProps) {
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);

  const company = useCompany(companyId);
  const link =
    company.data === undefined ? null : thermometerLinkOf(company.data, window.location.origin);

  if (link === null) return null;

  const showQr = () => {
    setQrTarget({
      title: `QR Code — ${LABEL}`,
      description: `${company.data?.name ?? ''}. Aponte a câmera para responder.`,
      url: link,
      fileName: `termometro-${company.data?.id ?? ''}`,
    });
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageSquareHeart className="size-4 text-primary" />
          Termômetro emocional
        </CardTitle>
        <CardDescription>
          Compartilhe o link com a equipe: cada pessoa escolhe o próprio setor e responde de forma
          anônima.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <WorkshopLinkRow label={LABEL} url={link} onShowQr={showQr} />
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
