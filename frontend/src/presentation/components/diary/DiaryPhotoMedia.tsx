import { FileText, ImageOff } from 'lucide-react';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import type { DiaryPhotoView } from '@/presentation/hooks/useDiary';

interface DiaryPhotoMediaProps {
  photo: DiaryPhotoView;
  alt: string;
  className?: string;
}

export function DiaryPhotoMedia({ photo, alt, className = 'h-40' }: DiaryPhotoMediaProps) {
  if (photo.loading) {
    return <Skeleton className={`w-full rounded-lg ${className}`} />;
  }

  if (photo.url === null) {
    return (
      <div
        className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground ${className}`}
      >
        <ImageOff className="size-5" />
        <span className="text-xs">Sem arquivo</span>
      </div>
    );
  }

  if (photo.type !== null && photo.type.startsWith('image/')) {
    return (
      <img
        src={photo.url}
        alt={alt}
        className={`w-full rounded-lg bg-muted object-contain ring-1 ring-foreground/10 ${className}`}
      />
    );
  }

  return (
    <a
      href={photo.url}
      target="_blank"
      rel="noreferrer"
      className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-muted text-center transition-colors hover:bg-muted/60 ${className}`}
    >
      <FileText className="size-6 text-primary" />
      <span className="px-3 text-xs break-all text-muted-foreground">
        {photo.name ?? 'Documento PDF'}
      </span>
      <span className="text-xs font-medium text-primary">Abrir</span>
    </a>
  );
}
