'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  // eslint-disable-next-line react/require-default-props
  isLoading?: boolean;
}

export function ClientOnly({
  children,
  isLoading = false,
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if (!isLoading || !hasMounted) {
      setHasMounted(true);
    }
  }, [isLoading, hasMounted]);

  if (!hasMounted) {
    return (
      null
    );
  }

  return children;
}
