/* eslint-disable react-hooks/rules-of-hooks */

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
import { SaleInvoiceApiResponse } from '@/query/sale-invoice/types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const saleInvoiceColumns: ColumnDef<SaleInvoiceApiResponse[number]>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: 'Invoice ID',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('id') || '-'}
      </div>
    ),
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <div className="font-medium">
        {new Date(row.getValue('date')).toLocaleDateString() || '-'}
      </div>
    ),
  },
  {
    id: 'customerName',
    accessorKey: 'customerName',
    header: 'Customer Name',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('customerName') || '-'}
      </div>
    ),
  },
  {
    id: 'subtotal',
    accessorKey: 'subtotal',
    header: 'Subtotal',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('subtotal') || '-'}
      </div>
    ),
  },
  {
    id: 'tax',
    accessorKey: 'tax',
    header: 'Tax',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('tax') || '-'}
      </div>
    ),
  },
  {
    id: 'total',
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('total') || '-'}
      </div>
    ),
  },
  {
    id: 'paid',
    accessorKey: 'paid',
    header: 'Paid',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('paid') || '-'}
      </div>
    ),
  },
  {
    id: 'remaining',
    accessorKey: 'remaining',
    header: 'Remaining',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('remaining') || '-'}
      </div>
    ),
  },
  {
    id: 'notes',
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('notes') || '-'}
      </div>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const saleInvoice = row.original;
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
              onClick={() => router.push(`${ROUTES.saleInvoice.path}/${saleInvoice.id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
