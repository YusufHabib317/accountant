'use client';

import { Input } from '@/components/ui/input';
import { PaymentsApiResponse } from '@/query/payments/types';
import { Label } from '../ui/label';

type PaymentFormProps = {
  paymentData: PaymentsApiResponse[number] | undefined;
}

export default function PaymentForm(props: PaymentFormProps) {
  const { paymentData } = props;

  return (
    <section className="mt-2">
      <form className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div>
            <Label>Amount</Label>
            <Input
              placeholder="product name"
              value={paymentData?.amount}
            />
          </div>
          <div>
            <Label>Note</Label>
            <Input placeholder="payment note" value={paymentData?.note} />
          </div>
        </div>
      </form>
    </section>
  );
}
