/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-array-index-key */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import dayjs from 'dayjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  Users,
  ClipboardList,
  Receipt,
  PiggyBank,
  CreditCard,
} from 'lucide-react';
import { getStaticsQuery } from '@/query/statics';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  // eslint-disable-next-line react/require-default-props
  description?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: statsData, isLoading: dataLoading } = useQuery(getStaticsQuery());

  const isLoading = sessionLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-12 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const stats = statsData?.details?.data;

  return (
    <div className="p-6 space-y-6">
      {session?.user && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
          <h1 className="text-4xl font-bold text-sky-600">
            Welcome Back
          </h1>
          <Badge variant="secondary" className="text-base px-4 py-1">
            {session.user.email}
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Suppliers"
          value={stats?.suppliersCount || 0}
          icon={Users}
          description="Active suppliers in your network"
        />

        <Card className="row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Purchase Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-muted-foreground">Total Invoices:</span>
              <span className="font-bold ml-2">{stats?.purchaseInvoiceStats.totalInvoices}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold ml-2">
                $
                {stats?.purchaseInvoiceStats.totalAmount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Paid:</span>
              <span className="font-bold ml-2 text-green-600">
                $
                {stats?.purchaseInvoiceStats.totalPaid}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-bold ml-2 text-red-500">
                $
                {stats?.purchaseInvoiceStats.totalRemaining}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-muted-foreground">Total Invoices:</span>
              <span className="font-bold ml-2">{stats?.saleInvoiceStats.totalInvoices}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold ml-2">
                $
                {stats?.saleInvoiceStats.totalAmount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Paid:</span>
              <span className="font-bold ml-2 text-green-600">
                $
                {stats?.saleInvoiceStats.totalPaid}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-bold ml-2 text-red-500">
                $
                {stats?.saleInvoiceStats.totalRemaining}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div>
                <span className="text-muted-foreground">Total Expenses:</span>
                <span className="font-bold ml-2">{stats?.expenseStats.totalExpenses}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-bold ml-2">
                  $
                  {stats?.expenseStats.totalAmount}
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">By Category</h4>
              <div className="space-y-1">
                {Object.entries(stats?.expenseStats.byCategory || {}).map(([category, amount]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-muted-foreground">{category}</span>
                    <span className="font-medium">
                      $
                      {amount as React.ReactNode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Payments
            </CardTitle>
            <CardDescription>
              Latest payment transactions across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Payment Overview</h4>
                  <div className="space-y-1">
                    <div>
                      <span className="text-muted-foreground">Total Payments:</span>
                      <span className="font-bold ml-2">{stats?.paymentStats.totalPayments}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-bold ml-2">
                        $
                        {stats?.paymentStats.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">By Type</h4>
                  <div className="space-y-1">
                    {Object.entries(stats?.paymentStats.byType || {}).map(([type, amount]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-muted-foreground">{type.replace('_', ' ')}</span>
                        <span className="font-medium">
                          $
                          {amount as React.ReactNode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Recent Transactions</h4>
                <div className="space-y-2">
                  {stats?.paymentStats.recentPayments.map((payment: any, index: any) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{payment.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {dayjs(payment.date).format('DD/MM/YYYY')}
                        </span>
                        <span className="font-bold">
                          $
                          {payment.amount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
