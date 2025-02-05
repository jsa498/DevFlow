'use client';

import { ReactNode } from 'react';
import { LoadingProvider } from "./LoadingProvider";
import GlobalLoadingScreen from "./GlobalLoadingScreen";
import ResourcePreloader from "./ResourcePreloader";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <LoadingProvider>
      <GlobalLoadingScreen />
      <ResourcePreloader />
      {children}
    </LoadingProvider>
  );
} 