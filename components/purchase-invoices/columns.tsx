'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/data';
import { PurchaseInvoiceApiResponse } from '@/query/purchase-invoice/types';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const purchaseInvoiceColumns: ColumnDef<PurchaseInvoiceApiResponse[number]>[] = [
  {
    id: 'paid',
    accessorKey: 'paid',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => {
          column.toggleSorting(column.getIsSorted() === 'asc');
        }}
      >
        paid
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('name');
      return (
        <div className="font-medium">
          {value ? String(value) : '-'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const purchaseInvoice = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="flex justify-center items-center"
              onClick={() => router.push(`${ROUTES.purchaseInvoice.path}/${purchaseInvoice.id}`)}
            >
              <Pencil />
              {' '}
              view
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
