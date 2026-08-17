import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export type SectorScope = 'admin' | 'empresa';

interface LinkProps {
  scope: SectorScope;
  className?: string;
  children: ReactNode;
}

export function SectorsListLink({ scope, className, children }: LinkProps) {
  if (scope === 'admin') {
    return (
      <Link to="/admin/setores" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <Link to="/empresa/setores" className={className}>
      {children}
    </Link>
  );
}

export function SectorDetailLink({
  scope,
  sectorId,
  className,
  children,
}: LinkProps & { sectorId: number }) {
  const params = { id: String(sectorId) };

  if (scope === 'admin') {
    return (
      <Link to="/admin/setores/$id" params={params} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <Link to="/empresa/setores/$id" params={params} className={className}>
      {children}
    </Link>
  );
}
