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
import { PurchaseInvoiceApiResponse } from '@/query/purchase-invoice/types';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { getSuppliersQuery } from '@/query/suppliers';
import { useQuery } from '@tanstack/react-query';

export const purchaseInvoiceColumns: ColumnDef<PurchaseInvoiceApiResponse[number]>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        ID
        <ArrowUpDown className="w-4 h-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('id') || '-'}
      </div>
    ),
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Date
        <ArrowUpDown className="w-4 h-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {dayjs(row.getValue('date')).format('DD/MM/YYYY')}
      </div>
    ),
  },
  {
    id: 'supplierId',
    accessorKey: 'supplierId',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Supplier
        <ArrowUpDown className="w-4 h-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const { data: suppliers } = useQuery(
        getSuppliersQuery({
          pagination: {
            pageSize: 100000,
          },
        }),
      );
      const supplierName = suppliers?.details?.data?.find((supplier: { id: string; }) => supplier.id === row.getValue('supplierId'))?.name;
      return (
        <div className="font-medium ml-5">
          {supplierName}
        </div>
      );
    },
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
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const purchaseInvoice = row.original;
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
              onClick={() => router.push(`${ROUTES.purchaseInvoice.path}/${purchaseInvoice.id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
