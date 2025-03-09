'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';

type Purchase = {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  product?: {
    title: string;
  };
};

interface RecentPurchasesProps {
  purchases: Purchase[];
}

export function RecentPurchases({ purchases }: RecentPurchasesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Purchases</CardTitle>
        <CardDescription>
          Latest transactions on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No purchases yet</p>
        ) : (
          <div className="space-y-8">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">
                    {purchase.user?.user_metadata?.full_name || purchase.user?.email || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {purchase.product?.title || 'Product'}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-medium">${purchase.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(purchase.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 