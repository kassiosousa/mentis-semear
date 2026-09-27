import { useEffect, useState } from 'react';

export function useObjectUrl(source: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (source === null) {
      setUrl(null);
      return;
    }

    const next = URL.createObjectURL(source);
    setUrl(next);

    return () => {
      URL.revokeObjectURL(next);
    };
  }, [source]);

  return url;
}
