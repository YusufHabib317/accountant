'use client';

import PurchaseInvoiceForm from '@/components/purchase-invoices/purchase-invoice-form';
import { getProductsQuery } from '@/query/products';
import { getSuppliersQuery } from '@/query/suppliers';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export default function PurchaseInvoiceCreate() {
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

  const isLoading = isLoadingProductsData || isLoadingSuppliersData;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PurchaseInvoiceForm
        mode="create"
        purchaseInvoiceData={undefined}
        suppliers={suppliersData?.details?.data}
        products={productsData?.details?.data}
      />
    </div>
  );
}
