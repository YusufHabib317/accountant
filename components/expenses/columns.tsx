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
import { MoreHorizontal, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export const expensesColumns: ColumnDef<ExpensesApiResponse[number]>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
      >
        Name
      </Button>
    ),
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="font-medium ml-5">
          {expense.name}
        </div>
      );
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => (
      <Button
        variant="ghost"
      >
        Amount
      </Button>
    ),
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="font-medium ml-5">
          {expense.amount}
        </div>
      );
    },
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: ({ column }) => (
      <Button
        variant="ghost"
      >
        Category
      </Button>
    ),
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="font-medium ml-5">
          {expense.category}
        </div>
      );
    },
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: ({ column }) => (
      <Button
        variant="ghost"
      >
        Date
      </Button>
    ),
    cell: ({ row }) => {
      const expense = row.original;
      return (
        <div className="font-medium ml-5">
          {expense.date}
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
