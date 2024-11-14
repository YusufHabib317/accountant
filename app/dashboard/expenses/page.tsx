'use client';

import { ClientOnly } from '@/components/common/client-only';
import { expensesColumns } from '@/components/expenses/columns';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/data';
import { useSearch } from '@/hooks';
import { getExpensesQuery } from '@/query/expense';
import { useQuery } from '@tanstack/react-query';
import { SortingState } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';

export default function ExpensesPage() {
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

  const { data, isLoading: isSuppliersLoading, isFetching } = useQuery(
    getExpensesQuery({
      pagination: {
        page,
      },
      search: searchValue ?? '',
    }),
  );

  const isLoading = isSuppliersLoading || isFetching;

  return (
    <div className="container mx-auto py-1">
      <ClientOnly>
        <div className="flex justify-end mb-5">
          <Link
            href={`${ROUTES.expense.path}/new`}
            className="px-4 py-2 border rounded-lg"
          >
            New
          </Link>
        </div>
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
            columns={expensesColumns}
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
