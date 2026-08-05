'use client';

import { Notice } from '@/components/notice';
import { PropertyCard } from '@/components/property-card';
import { ApiError, propertiesApi } from '@/lib/api';
import type { PropertyPage, PropertyType } from '@/types/api';
import { FormEvent, useEffect, useMemo, useState } from 'react';

const initialFilters = {
  search: '',
  city: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  sort: 'newest',
};

export function PropertyExplorer() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PropertyPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: '9' });
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [appliedFilters, page]);

  useEffect(() => {
    const controller = new AbortController();
    propertiesApi
      .list(new URLSearchParams(queryString), controller.signal)
      .then(setResult)
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
  }, [queryString]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setPage(1);
    setAppliedFilters(filters);
  };

  const update = (key: keyof typeof filters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  return (
    <>
      <form className="filter-panel" onSubmit={submit}>
        <div className="field field-search">
          <label htmlFor="property-search">What are you looking for?</label>
          <input
            id="property-search"
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            placeholder="Garden, downtown, workspace…"
          />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input
            id="city"
            value={filters.city}
            onChange={(event) => update('city', event.target.value)}
            placeholder="Any city"
          />
        </div>
        <div className="field">
          <label htmlFor="type">Property type</label>
          <select
            id="type"
            value={filters.type}
            onChange={(event) => update('type', event.target.value)}
          >
            <option value="">All types</option>
            {(
              [
                'HOUSE',
                'APARTMENT',
                'CONDO',
                'TOWNHOUSE',
                'LAND',
                'COMMERCIAL',
              ] as PropertyType[]
            ).map((type) => (
              <option value={type} key={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="bedrooms">Min. bedrooms</label>
          <select
            id="bedrooms"
            value={filters.bedrooms}
            onChange={(event) => update('bedrooms', event.target.value)}
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}+
              </option>
            ))}
          </select>
        </div>
        <div className="field field-price">
          <label htmlFor="min-price">Price range</label>
          <div>
            <input
              id="min-price"
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={(event) => update('minPrice', event.target.value)}
              placeholder="Min"
            />
            <span>—</span>
            <input
              aria-label="Maximum price"
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(event) => update('maxPrice', event.target.value)}
              placeholder="Max"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="sort">Sort by</label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(event) => update('sort', event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <button className="button filter-button" type="submit">
          Show matching homes
        </button>
      </form>

      <div className="results-heading" aria-live="polite">
        <div>
          <span className="eyebrow">Marketplace</span>
          <h2>
            {loading
              ? 'Finding the right addresses…'
              : `${result?.total ?? 0} ${result?.total === 1 ? 'home' : 'homes'} available`}
          </h2>
        </div>
        {Object.values(appliedFilters).some(Boolean) && (
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setLoading(true);
              setError(null);
              setFilters(initialFilters);
              setAppliedFilters(initialFilters);
              setPage(1);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {error ? (
        <Notice title="We couldn't load the marketplace" tone="error">
          {error}
        </Notice>
      ) : loading ? (
        <div className="property-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="property-card skeleton-card" key={index} />
          ))}
        </div>
      ) : result && result.items.length > 0 ? (
        <>
          <div className="property-grid">
            {result.items.map((property) => (
              <PropertyCard property={property} key={property.id} />
            ))}
          </div>
          {result.totalPages > 1 && (
            <nav className="pagination" aria-label="Property results pages">
              <button
                className="button button-quiet"
                type="button"
                disabled={page === 1}
                onClick={() => {
                  setLoading(true);
                  setPage((value) => value - 1);
                }}
              >
                Previous
              </button>
              <span>
                Page {page} of {result.totalPages}
              </span>
              <button
                className="button button-quiet"
                type="button"
                disabled={page >= result.totalPages}
                onClick={() => {
                  setLoading(true);
                  setPage((value) => value + 1);
                }}
              >
                Next
              </button>
            </nav>
          )}
        </>
      ) : (
        <Notice title="No exact matches yet">
          Try widening the price range, choosing another city, or removing a
          filter.
        </Notice>
      )}
    </>
  );
}
