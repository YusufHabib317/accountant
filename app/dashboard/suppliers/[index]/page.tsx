'use client';

import SupplierForm from '@/components/suppliers/supplier-form';
import { getSupplierQuery } from '@/query/suppliers';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function Supplier() {
  const params = useParams();
  const { index: id } = params;
  const { data, isLoading } = useQuery(getSupplierQuery(id ? `${id}` : ''));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  return (
    <div><SupplierForm mode="update" supplierData={data.details.data} /></div>
  );
}
