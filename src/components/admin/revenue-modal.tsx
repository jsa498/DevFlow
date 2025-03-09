'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';

interface Purchase {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  user?: {
    full_name?: string | null;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  product?: {
    title: string;
  };
}

interface RevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchases: Purchase[];
}

export function RevenueModal({ isOpen, onClose, purchases }: RevenueModalProps) {
  // Calculate total revenue
  const totalRevenue = purchases.reduce((acc, purchase) => acc + purchase.amount, 0);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revenue Details</DialogTitle>
          <DialogDescription>
            Total Revenue: ${totalRevenue.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No purchases found</TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      {purchase.user?.full_name || 
                       purchase.user?.user_metadata?.full_name || 
                       purchase.user?.email || 
                       'Anonymous'}
                    </TableCell>
                    <TableCell>{purchase.product?.title || 'Unknown Product'}</TableCell>
                    <TableCell>${purchase.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(purchase.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        purchase.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : purchase.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        {purchase.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
} 