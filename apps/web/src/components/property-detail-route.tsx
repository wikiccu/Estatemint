'use client';

import { Notice } from '@/components/notice';
import { PropertyDetail } from '@/components/property-detail';
import { useSearchParams } from 'next/navigation';

export function PropertyDetailRoute() {
  const id = useSearchParams().get('id')?.trim();

  if (!id) {
    return (
      <section className="shell page-section">
        <Notice title="This property link is incomplete" tone="error">
          Return to the marketplace and choose a property to view its details.
        </Notice>
      </section>
    );
  }

  return <PropertyDetail id={id} />;
}
