import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-500/10">
        <img
          src="/assets/logo-verde.png"
          alt=""
          aria-hidden
          className="absolute top-1/2 left-1/2 w-[42px] max-w-none -translate-x-1/2 -translate-y-[34%]"
        />
      </span>

      <span className="truncate text-base font-semibold tracking-tight text-title">
        Mentis Semear
      </span>
    </div>
  );
}
