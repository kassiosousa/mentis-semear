import type { ReactNode } from 'react';
import SplitText from '@/presentation/components/animations/SplitText';

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeading({ title, subtitle, children }: PageHeadingProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <SplitText
          key={title}
          text={title}
          tag="h1"
          textAlign="left"
          className="pb-1 text-2xl font-semibold tracking-tight text-title sm:text-3xl"
          splitType="chars"
          delay={26}
          duration={0.7}
          ease="power3.out"
          from={{ opacity: 0, y: 28 }}
          to={{ opacity: 1, y: 0 }}
        />

        {subtitle !== undefined && (
          <p className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both text-sm text-muted-foreground delay-300 duration-700">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
