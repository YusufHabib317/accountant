'use client';

import ProductForm from '@/components/suppliers/supplier-form';
import { getSupplierQuery } from '@/query/suppliers';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function Supplier() {
  const params = useParams();
  const { index: id } = params;
  const { data, isLoading } = useQuery(getSupplierQuery(id ? `${id}` : ''));

  if (isLoading) {
    return <div className="h-screen"><Loader2 className="animate-spin" /></div>;
  }
  return (
    <div><ProductForm mode="update" supplierData={data.details.data} /></div>
  );
}
