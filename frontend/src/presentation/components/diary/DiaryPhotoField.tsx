import { Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import { DIARY_PHOTO_ACCEPT, type DiaryPhotoSlot } from '@/domain/diary/entities/Diary';
import { DiaryPhotoMedia } from '@/presentation/components/diary/DiaryPhotoMedia';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { useDiaryPhoto } from '@/presentation/hooks/useDiary';

interface DiaryPhotoFieldProps {
  slot: DiaryPhotoSlot;
  diaryId: number | null;
  file: File | null;
  savedUrl: string | null;
  error?: string;
  disabled?: boolean;
  onSelect: (file: File | null) => void;
}

export function DiaryPhotoField({
  slot,
  diaryId,
  file,
  savedUrl,
  error,
  disabled = false,
  onSelect,
}: DiaryPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const photo = useDiaryPhoto(diaryId, slot, file, savedUrl !== null);
  const inputId = `diary-photo-${slot}`;
  const filled = file !== null || savedUrl !== null;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId}>Foto {slot}</Label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={DIARY_PHOTO_ACCEPT}
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          onSelect(event.target.files?.[0] ?? null);
          event.target.value = '';
        }}
      />

      <div
        className={`flex flex-col gap-2 rounded-xl border p-2 ${
          error === undefined ? 'border-border' : 'border-destructive'
        }`}
      >
        <DiaryPhotoMedia photo={photo} alt={`Foto ${slot} do encontro`} />

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="size-3.5" />
            {filled ? 'Trocar' : 'Selecionar'}
          </Button>

          {file !== null && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={() => onSelect(null)}
              title="Remover arquivo selecionado"
              aria-label={`Remover a foto ${slot} selecionada`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>

        <p className="truncate text-xs text-muted-foreground">
          {file !== null ? file.name : savedUrl !== null ? 'Arquivo já enviado' : 'Nenhum arquivo'}
        </p>
      </div>

      {error !== undefined && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
