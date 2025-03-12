'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, ShoppingCart } from "lucide-react";
import { UserListModal } from './user-list-modal';
import { RevenueModal } from './revenue-modal';

interface StatsCardsProps {
  totalUsers: number;
  totalRevenue: number;
  totalPurchases: number;
  users: any[];
  purchases: any[];
  testMode?: boolean;
}

export function StatsCards({ totalUsers, totalRevenue, totalPurchases, users, purchases, testMode = true }: StatsCardsProps) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showPurchasesModal, setShowPurchasesModal] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setShowUserModal(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <h3 className="text-3xl font-bold mt-2">{totalUsers}</h3>
                <p className="text-xs text-muted-foreground mt-1">Registered users</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setShowRevenueModal(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2">${totalRevenue.toFixed(2)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {testMode ? 'Test mode revenue' : 'Live mode revenue'}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full ${testMode ? 'bg-amber-500/10' : 'bg-green-500/10'} flex items-center justify-center`}>
                <DollarSign className={`h-6 w-6 ${testMode ? 'text-amber-500' : 'text-green-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setShowPurchasesModal(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Purchases</p>
                <h3 className="text-3xl font-bold mt-2">{totalPurchases}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {testMode ? 'Test mode purchases' : 'Live mode purchases'}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full ${testMode ? 'bg-amber-500/10' : 'bg-green-500/10'} flex items-center justify-center`}>
                <ShoppingCart className={`h-6 w-6 ${testMode ? 'text-amber-500' : 'text-green-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <UserListModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        users={users}
      />

      <RevenueModal
        isOpen={showRevenueModal}
        onClose={() => setShowRevenueModal(false)}
        purchases={purchases}
        testMode={testMode}
      />

      <RevenueModal
        isOpen={showPurchasesModal}
        onClose={() => setShowPurchasesModal(false)}
        purchases={purchases}
        testMode={testMode}
      />
    </>
  );
} 