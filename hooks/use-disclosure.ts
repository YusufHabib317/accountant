'use client';

import { useState } from 'react';

export function useDisclosure() {
  const [opened, setOpened] = useState(false);

  const open = () => setOpened(true);
  const close = () => setOpened(false);
  const toggle = () => setOpened((prev) => !prev);

  return {
    opened, open, close, toggle,
  };
}
