'use client';

import { ClientOnly } from '@/components/common/client-only';
import { paymentsColumns } from '@/components/payments/columns';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks';
import { getPaymentsQuery } from '@/query/payments';
import { useQuery } from '@tanstack/react-query';
import { SortingState } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';

export default function PaymentsPage() {
  const { handleSearch, searchValue } = useSearch();
  const [value, setValue] = useState(searchValue);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setValue(searchValue);
  }, [searchValue]);

  const handleSearchFn = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    handleSearch(newValue);
  };

  const { data, isLoading: isLoadingPayments, isFetching } = useQuery(
    getPaymentsQuery({
      pagination: {
        page,
      },
      search: searchValue ?? '',
    }),
  );

  const isLoading = isLoadingPayments || isFetching;

  return (
    <div className="container mx-auto py-1">
      <ClientOnly>
        <div className="flex flex-col space-y-4">
          <div className="border p-3 rounded-sm">
            <Input
              value={value}
              onChange={handleSearchFn}
              defaultValue={searchValue}
              className="w-60"
              placeholder="Search..."
            />
            {isFetching && !isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
            )}
          </div>
          <DataTable
            columns={paymentsColumns}
            data={data?.details?.data ?? []}
            meta={data?.details?.meta}
            isLoading={isLoading}
            setSorting={setSorting}
            sorting={sorting}
            page={page}
            setPage={setPage}
          />
        </div>
      </ClientOnly>
    </div>
  );
}
