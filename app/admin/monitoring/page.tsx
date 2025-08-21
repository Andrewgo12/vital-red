"use client";

import React from 'react';
import { Header } from '@/components/layout/header';
import { SystemMonitor } from '@/components/monitoring/system-monitor';

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Monitoreo del Sistema - VITAL RED Gmail IA" />
      
      <div className="container mx-auto px-6 py-8">
        <SystemMonitor 
          autoRefresh={true}
          refreshInterval={30000}
        />
      </div>
    </div>
  );
}
