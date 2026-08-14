import { PropertyDetailRoute } from '@/components/property-detail-route';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Property details',
  description: 'Review a property and request a private tour.',
};

export default function PropertyDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="shell page-loading">
          <span className="spinner" />
          <p>Opening the property…</p>
        </div>
      }
    >
      <PropertyDetailRoute />
    </Suspense>
  );
}
