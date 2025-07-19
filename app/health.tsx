
import React from 'react';
import { HealthDashboard } from '@/components/HealthDashboard';
import PageTemplate from '@/components/PageTemplate';

export default function HealthScreen() {
  return (
    <PageTemplate title="App Health" showBackButton>
      <HealthDashboard />
    </PageTemplate>
  );
}
