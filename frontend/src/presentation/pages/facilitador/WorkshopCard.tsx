import { Link } from '@tanstack/react-router';
import { ArrowRight, Building2, CalendarClock, MapPin } from 'lucide-react';
import type { Workshop } from '@/domain/workshop/entities/Workshop';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { AssessmentSummary, CheckInCount } from '@/presentation/pages/admin/WorkshopMetrics';
import { WorkshopStatusBadge } from '@/presentation/pages/facilitador/WorkshopStatusBadge';

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

interface WorkshopCardProps {
  workshop: Workshop;
  companyName: string;
}

export function WorkshopCard({ workshop, companyName }: WorkshopCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Oficina #{workshop.id}</CardTitle>
        <CardAction>
          <WorkshopStatusBadge workshop={workshop} />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5 text-sm">
        <p className="flex items-center gap-2">
          <CalendarClock className="size-4 shrink-0 text-primary" />
          <span className="font-medium text-title">
            {formatDate(workshop.datetime)} às {formatTime(workshop.datetime)}
          </span>
        </p>

        <p className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="size-4 shrink-0" />
          <span className="truncate">{companyName}</span>
        </p>

        <p className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{workshop.address}</span>
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-4 border-t border-border pt-3 text-sm">
          <CheckInCount workshopId={workshop.id} />
          <AssessmentSummary workshopId={workshop.id} />
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link to="/facilitador/oficinas/$id" params={{ id: String(workshop.id) }}>
            Ver mais
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
