'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getPaymentQuery } from '@/query/payments';
import PaymentForm from '@/components/payments/payment-form';

export default function Payment() {
  const params = useParams();
  const { index: id } = params;
  const { data, isLoading: isLoadingPayment } = useQuery(getPaymentQuery(id ? `${id}` : ''));

  if (isLoadingPayment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <PaymentForm
      paymentData={data?.details?.data}
    />
  );
}
