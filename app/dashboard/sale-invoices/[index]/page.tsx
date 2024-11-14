'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getProductsQuery } from '@/query/products';
import SaleInvoiceForm from '@/components/sale-invoices/sale-invoice-form';
import { getSaleInvoiceQuery } from '@/query/sale-invoice';

export default function SaleInvoice() {
  const params = useParams();
  const { index: id } = params;

  const { data, isLoading: isLoadingSaleInvoice } = useQuery(getSaleInvoiceQuery(id ? `${id}` : ''));

  const { data: productsData, isLoading: isLoadingProductsData } = useQuery(getProductsQuery({
    pagination: {
      pageSize: 100000,
    },
  }));

  const isLoading = isLoadingSaleInvoice
  || isLoadingProductsData;

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
    <SaleInvoiceForm
      mode="update"
      saleInvoiceData={data?.details?.data}
      products={productsData?.details?.data}
    />
  );
}
