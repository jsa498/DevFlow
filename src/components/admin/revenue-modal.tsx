'use client';

import { useState } from 'react';
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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface Purchase {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  test_mode?: boolean;
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
  testMode?: boolean;
}

export function RevenueModal({ isOpen, onClose, purchases, testMode = true }: RevenueModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calculate total revenue
  const totalRevenue = purchases.reduce((acc, purchase) => acc + purchase.amount, 0);
  
  // Filter purchases based on search query
  const filteredPurchases = purchases.filter(purchase => {
    const customerName = (
      purchase.user?.full_name || 
      purchase.user?.user_metadata?.full_name || 
      purchase.user?.email || 
      ''
    ).toLowerCase();
    const productTitle = (purchase.product?.title || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return customerName.includes(query) || productTitle.includes(query);
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Revenue Details</DialogTitle>
            <DialogDescription>
              Total {testMode ? 'Test' : 'Live'} Revenue: ${totalRevenue.toFixed(2)}
            </DialogDescription>
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
        </DialogHeader>
        
        <div className="relative my-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer or product..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
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
              {filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {searchQuery ? 'No purchases match your search' : `No ${testMode ? 'test' : 'live'} purchases found`}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
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