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
import { ProductsApiResponse } from '@/query/products/types';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const productsColumns: ColumnDef<ProductsApiResponse[number]>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => {
          column.toggleSorting(column.getIsSorted() === 'asc');
        }}
      >
        Name
        <ArrowUpDown className="w-4 h-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('name');
      return (
        <div className="font-medium ml-5">
          {value ? String(value) : '-'}
        </div>
      );
    },
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => {
          column.toggleSorting(column.getIsSorted() === 'asc');
        }}
      >
        Code
        <ArrowUpDown className="w-4 h-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('code');
      return (
        <div className="font-medium ml-5">
          {value ? String(value) : '-'}
        </div>
      );
    },
  },
  {
    id: 'cost',
    accessorKey: 'cost',
    header: ({ column }) => (
      <Button
        variant="ghost"
      >
        Cost
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('cost');
      return (
        <div className="font-medium ml-5">
          {value ? String(value) : '-'}
        </div>
      );
    },
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: ({ column }) => (
      <Button
        variant="ghost"
      >
        Price
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('price');
      return (
        <div className="font-medium ml-5">
          {value ? String(value) : '-'}
        </div>
      );
    },
  },
  {
    id: 'salePrice',
    accessorKey: 'salePrice',
    header: ({ column }) => (
      <Button
        variant="ghost"
      >
        Sale Price
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('salePrice');
      return (
        <div className="font-medium ml-5">
          {value ? String(value) : '-'}
        </div>
      );
    },
  },
  {
    id: 'stock',
    accessorKey: 'stock',
    header: ({ column }) => (
      <Button
        variant="ghost"
      >
        Stock
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('stock');
      return (
        <div className="font-medium ml-5">
          {value as React.ReactNode}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
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
              onClick={() => router.push(`${ROUTES.product.path}/${product.id}`)}
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
