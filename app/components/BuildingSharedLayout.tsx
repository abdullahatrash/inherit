// app/components/SharedLayout.tsx

import { Outlet } from '@remix-run/react';
import BuildingSidebar  from './BuildingSidebar';
import  BuildingTopNavigation  from './BuildingTopNavigation';
import React from 'react';

export function SharedLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <BuildingSidebar />
      <div className="flex-1 overflow-auto">
        <BuildingTopNavigation />
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
