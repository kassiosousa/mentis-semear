import { useState } from 'react';

export function useReportPage(filtersKey: string): [number, (page: number) => void] {
  const [page, setPage] = useState(1);
  const [currentKey, setCurrentKey] = useState(filtersKey);

  if (currentKey !== filtersKey) {
    setCurrentKey(filtersKey);
    setPage(1);
  }

  return [page, setPage];
}
