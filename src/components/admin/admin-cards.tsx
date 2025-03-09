'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, BookOpen, PieChart, Settings, Tag } from "lucide-react";

export function AdminCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              <Link href="/dashboard/admin/users" className="hover:underline">
                User Management
              </Link>
            </CardTitle>
          </div>
          <CardDescription>
            View and manage user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Access user profiles, manage roles, and view user activity.
          </p>
        </CardContent>
      </Card>

      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              <Link href="/dashboard/admin/products" className="hover:underline">
                Product Management
              </Link>
            </CardTitle>
          </div>
          <CardDescription>
            Create and manage digital products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add new products, update existing ones, and manage pricing.
          </p>
        </CardContent>
      </Card>

      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              <Link href="/dashboard/admin/courses" className="hover:underline">
                Course Management
              </Link>
            </CardTitle>
          </div>
          <CardDescription>
            Create and manage online courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Build course content, organize lessons, and track student progress.
          </p>
        </CardContent>
      </Card>

      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              <Link href="/dashboard/admin/coaching" className="hover:underline">
                Pricing Tiers Management
              </Link>
            </CardTitle>
          </div>
          <CardDescription>
            Create and manage pricing tiers for your coaching service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set up different pricing options with varying session counts and features.
          </p>
        </CardContent>
      </Card>

      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              <Link href="/dashboard/admin/analytics" className="hover:underline">
                Analytics
              </Link>
            </CardTitle>
          </div>
          <CardDescription>
            View site analytics and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Track user engagement, sales performance, and other key metrics.
          </p>
        </CardContent>
      </Card>

      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              <Link href="/dashboard/admin/setup" className="hover:underline">
                Site Configuration
              </Link>
            </CardTitle>
          </div>
          <CardDescription>
            Configure site settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage global settings, payment integrations, and site appearance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 