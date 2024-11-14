/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-array-index-key */

'use client';

import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { getStaticsQuery } from '@/query/statics';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import {
  Key,
} from 'react';
import { useSession } from '@/lib/auth-client';
import { Badge } from '@/components/ui/badge';

export default function StaticsPage() {
  const { data: session, isPending } = useSession();

  const { data, isLoading } = useQuery(
    getStaticsQuery(),
  );

  if (isLoading || isPending) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {session?.user && (
      <div className="flex gap-5 items-center">
        <p className="text-[3rem] text-sky-600 font-extrabold">Welcome</p>
        <Badge className="mt-2 text-[1rem]">
          <span className="font-extrabold">
            {session.user.email}
          </span>
        </Badge>
      </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {/* Suppliers */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Total Suppliers:
              <strong>{data?.details?.data?.suppliersCount}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Purchase Invoices */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Purchase Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Total Invoices:
              <strong>{data?.details?.data?.purchaseInvoiceStats.totalInvoices}</strong>
            </p>
            <p>
              Total Amount:
              <strong>
                $
                {data?.details?.data?.purchaseInvoiceStats.totalAmount}
              </strong>
            </p>
            <p>
              Total Paid:
              <strong>
                $
                {data?.details?.data?.purchaseInvoiceStats.totalPaid}
              </strong>
            </p>
            <p>
              Total Remaining:
              <strong>
                $
                {data?.details?.data?.purchaseInvoiceStats.totalRemaining}
              </strong>
            </p>
          </CardContent>
        </Card>

        {/* Sale Invoices */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Sale Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Total Invoices:
              <strong>{data?.details?.data?.saleInvoiceStats.totalInvoices}</strong>
            </p>
            <p>
              Total Amount:
              <strong>
                $
                {data?.details?.data?.saleInvoiceStats.totalAmount}
              </strong>
            </p>
            <p>
              Total Paid:
              <strong>
                $
                {data?.details?.data?.saleInvoiceStats.totalPaid}
              </strong>
            </p>
            <p>
              Total Remaining:
              <strong>
                $
                {data?.details?.data?.saleInvoiceStats.totalRemaining}
              </strong>
            </p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Total Expenses:
              <strong>{data?.details?.data?.expenseStats.totalExpenses}</strong>
            </p>
            <p>
              Total Amount:
              <strong>
                $
                {data?.details?.data?.expenseStats.totalAmount}
              </strong>
            </p>
            <div>
              <h3 className="mt-2">By Category:</h3>
              <ul className="list-disc ml-5">
                {Object.entries(data?.details?.data?.expenseStats.byCategory).map(([category, amount]) => (
                  <li key={category}>
                    {category}
                    :
                    {' '}
                    <strong>
                      $
                      {amount as React.ReactNode}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Total Payments:
              <strong>{data?.details?.data?.paymentStats.totalPayments}</strong>
            </p>
            <p>
              Total Amount:
              <strong>
                $
                {data?.details?.data?.paymentStats.totalAmount}
              </strong>
            </p>
            <div>
              <h3 className="mt-2">By Type:</h3>
              <ul className="list-disc ml-5">
                {Object.entries(data?.details?.data?.paymentStats.byType).map(([type, amount]) => (
                  <li key={type}>
                    {type}
                    :
                    {' '}
                    <strong>
                      $
                      {amount as React.ReactNode}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mt-2">Recent Payments:</h3>
              <ul className="list-disc ml-5">
                {data?.details?.data?.paymentStats.recentPayments.map((payment: any, index: Key) => (
                  <li key={index}>
                    {dayjs(payment.date).format('DD/MM/YYYY')}
                    {' '}
                    -
                    {payment.type}
                    :
                    <strong>
                      $
                      {payment.amount}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
