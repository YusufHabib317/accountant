'use client';

import SaleInvoiceForm from '@/components/sale-invoices/sale-invoice-form';
import { getProductsQuery } from '@/query/products';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export default function SaleCreate() {
  const { data: productsData, isLoading: isLoadingProductsData } = useQuery(getProductsQuery({
    pagination: {
      pageSize: 100000,
    },
  }));

  const isLoading = isLoadingProductsData;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <SaleInvoiceForm
        mode="create"
        saleInvoiceData={undefined}
        products={productsData?.details?.data}
      />
    </div>
  );
}
