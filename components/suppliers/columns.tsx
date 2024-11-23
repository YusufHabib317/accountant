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
import { suppliersApiResponse } from '@/query/suppliers/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown, MoreHorizontal, Pencil, Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteSupplierMutation } from '@/query/suppliers';

export const useDeleteSupplier = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    ...deleteSupplierMutation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers'],
      });
      toast({
        title: 'Success',
        description: 'Supplier deleted successfully',
      });
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers'],
        exact: true,
      });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete supplier',
      });
    },
  });
};

export const suppliersColumns: ColumnDef<suppliersApiResponse[number]>[] = [
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
        <div className="font-medium">
          {value ? String(value) : '-'}
        </div>
      );
    },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => {
          column.toggleSorting(column.getIsSorted() === 'asc');
        }}
      >
        Email
        <ArrowUpDown className="w-4 h-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('email');
      return (
        <div className="font-medium">
          {value ? String(value) : '-'}
        </div>
      );
    },
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: () => <div className="font-semibold">Phone</div>,
    cell: ({ row }) => {
      const value = row.getValue('phone');
      return (
        <div className="font-medium">
          {value ? String(value) : '-'}
        </div>
      );
    },
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: () => <div className="font-semibold">Address</div>,
    cell: ({ row }) => {
      const value = row.getValue('address');
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
      const supplier = row.original;
      const router = useRouter();
      const [open, setOpen] = useState(false);
      const { mutate: deleteSupplier, isLoading } = useDeleteSupplier(supplier.id);

      const handleDelete = () => {
        if (supplier.id) {
          deleteSupplier();
          setOpen(false);
        }
      };

      return (
        <>
          {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-65">
            <div className="flex flex-col items-center space-y-4">
              <div className="loader" />
              <p className="text-lg font-semibold text-white tracking-wide animate-pulse">Deleting...</p>
            </div>
          </div>

          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => router.push(`${ROUTES.supplier.path}/${supplier.id}`)}
              >
                <Pencil className="h-4 w-4" />
                {' '}
                Edit
              </DropdownMenuItem>
              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    {' '}
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete
                      {' '}
                      {supplier.name}
                      ? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
