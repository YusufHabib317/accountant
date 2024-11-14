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
import { ExpensesApiResponse } from '@/query/expense/types';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export const expensesColumns: ColumnDef<ExpensesApiResponse[number]>[] = [
  {
    id: 'amount',
    accessorKey: 'AMOUNT',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => {
          column.toggleSorting(column.getIsSorted() === 'asc');
        }}
      >
        AMOUNT
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="font-medium">
          {expense.amount }
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const expense = row.original;
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
              onClick={() => router.push(`${ROUTES.expense.path}/${expense.id}`)}
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
