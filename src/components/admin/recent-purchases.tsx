'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";

type Purchase = {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  test_mode?: boolean;
  user?: {
    email: string;
    full_name?: string;
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
  testMode?: boolean;
}

export function RecentPurchases({ purchases, testMode = true }: RecentPurchasesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>
              Latest transactions on the platform
            </CardDescription>
          </div>
          {testMode ? (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
              Test Mode
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
              Live Mode
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No {testMode ? 'test' : 'live'} purchases yet
          </p>
        ) : (
          <div className="space-y-8">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">
                    {purchase.user?.full_name || purchase.user?.user_metadata?.full_name || purchase.user?.email || 'Unknown User'}
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