'use client';

import PurchaseInvoiceForm from '@/components/purchase-invoices/purchase-invoice-form';
import { getPurchaseInvoiceQuery } from '@/query/purchase-invoice';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getProductsQuery } from '@/query/products';
import { getSuppliersQuery } from '@/query/suppliers';

export default function PurchaseInvoice() {
  const params = useParams();
  const { index: id } = params;
  const { data, isLoading: isLoadingPurchaseInvoice } = useQuery(getPurchaseInvoiceQuery(id ? `${id}` : ''));

  const { data: productsData, isLoading: isLoadingProductsData } = useQuery(getProductsQuery({
    pagination: {
      pageSize: 100000,
    },
  }));
  const { data: suppliersData, isLoading: isLoadingSuppliersData } = useQuery(getSuppliersQuery({
    pagination: {
      pageSize: 100000,
    },
  }));

  const isLoading = isLoadingPurchaseInvoice
  || isLoadingProductsData
  || isLoadingSuppliersData;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (isLoading) {
    return <div className="h-[calc(100vh-60px)] w-full flex justify-center items-center"><Loader2 className="animate-spin" /></div>;
  }
  return (
    <PurchaseInvoiceForm
      mode="update"
      purchaseInvoiceData={data?.details?.data}
      suppliers={suppliersData?.details?.data}
      products={productsData?.details?.data}
    />
  );
}
