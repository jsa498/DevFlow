'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, ShoppingCart } from "lucide-react";
import { UserListModal } from "./user-list-modal";
import { RevenueModal } from "./revenue-modal";

interface User {
  id: string;
  full_name?: string | null;
  email?: string;
  created_at: string;
}

interface Purchase {
  id: string;
  amount: number;
  created_at: string;
  user?: {
    full_name?: string | null;
    email?: string;
  };
  product?: {
    title: string;
  };
  user_id?: string;
  product_id?: string;
}

interface StatsCardsProps {
  totalUsers?: number;
  totalRevenue?: number;
  totalPurchases?: number;
  users: User[];
  purchases: Purchase[];
}

export function StatsCards({ totalUsers, totalRevenue, totalPurchases, users = [], purchases = [] }: StatsCardsProps) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showPurchasesModal, setShowPurchasesModal] = useState(false);

  // Ensure we have valid data
  const safeUsers = Array.isArray(users) ? users : [];
  const safePurchases = Array.isArray(purchases) ? purchases : [];
  
  // Calculate totals if not provided
  const calculatedTotalUsers = safeUsers.length;
  const calculatedTotalRevenue = safePurchases.reduce((acc, p) => acc + (p.amount || 0), 0);
  const calculatedTotalPurchases = safePurchases.length;
  
  // Use provided totals or calculated ones
  const displayTotalUsers = totalUsers !== undefined ? totalUsers : calculatedTotalUsers;
  const displayTotalRevenue = totalRevenue !== undefined ? totalRevenue : calculatedTotalRevenue;
  const displayTotalPurchases = totalPurchases !== undefined ? totalPurchases : calculatedTotalPurchases;
  
  // Log for debugging
  useEffect(() => {
    console.log('StatsCards - Users:', safeUsers.length);
    console.log('StatsCards - Purchases:', safePurchases.length);
    console.log('StatsCards - Display Totals:', { 
      users: displayTotalUsers, 
      revenue: displayTotalRevenue, 
      purchases: displayTotalPurchases 
    });
  }, [safeUsers, safePurchases, displayTotalUsers, displayTotalRevenue, displayTotalPurchases]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setShowUserModal(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayTotalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setShowRevenueModal(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${displayTotalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime revenue</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setShowPurchasesModal(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayTotalPurchases}</div>
            <p className="text-xs text-muted-foreground">Completed purchases</p>
          </CardContent>
        </Card>
      </div>

      <UserListModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        users={safeUsers}
      />

      <RevenueModal
        isOpen={showRevenueModal}
        onClose={() => setShowRevenueModal(false)}
        purchases={safePurchases}
      />

      <RevenueModal
        isOpen={showPurchasesModal}
        onClose={() => setShowPurchasesModal(false)}
        purchases={safePurchases}
      />
    </>
  );
} 