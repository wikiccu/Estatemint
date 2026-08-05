'use client';

import { Notice } from '@/components/notice';
import { PropertyCard } from '@/components/property-card';
import { ApiError, propertiesApi } from '@/lib/api';
import type { Property } from '@/types/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ pageSize: '3', sort: 'newest' });

    propertiesApi
      .list(params, controller.signal)
      .then((result) => setProperties(result.items))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof ApiError
              ? reason.message
              : 'Properties are unavailable.',
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="property-grid" aria-label="Loading featured properties">
        {[0, 1, 2].map((item) => (
          <div className="property-card skeleton-card" key={item} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Notice title="Homes are taking a moment" tone="error">
        {error}
      </Notice>
    );
  }

  if (properties.length === 0) {
    return (
      <Notice title="The collection is just getting started">
        No active listings are available yet. Agents can publish the first
        listing from their dashboard.
      </Notice>
    );
  }

  return (
    <>
      <div className="property-grid">
        {properties.map((property) => (
          <PropertyCard property={property} key={property.id} />
        ))}
      </div>
      <div className="section-action">
        <Link className="text-link arrow-link" href="/properties">
          See every available home <span>→</span>
        </Link>
      </div>
    </>
  );
}
