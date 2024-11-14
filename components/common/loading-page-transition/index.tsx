'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function LoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    handleStart();

    return () => handleStop();
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="w-full min-h-screen flex justify-center items-center z-50">
      <Loader2 color="red" className="animate-spin" />
    </div>
  );
}
