import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export const useSearch = () => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = new URLSearchParams(searchParams as any);

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 400);

  const searchValue = searchParams.get('query')?.toString();

  return { handleSearch, searchValue };
};
