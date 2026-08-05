'use client';

import { useAuth } from '@/components/auth-provider';
import { ApiError, propertiesApi } from '@/lib/api';
import { getFormString } from '@/lib/form-data';
import type { Currency, PropertyType } from '@/types/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

const listingRoles = ['SELLER', 'AGENT', 'ADMIN'];

export function ListingForm() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  if (isLoading)
    return (
      <div className="page-loading">
        <span className="spinner" />
        <p>Checking listing access…</p>
      </div>
    );
  if (!user || !token)
    return (
      <AccessMessage
        title="Sign in to publish a property."
        href="/login?next=/dashboard/listings/new"
        label="Sign in"
      />
    );
  if (!listingRoles.includes(user.role))
    return (
      <AccessMessage
        title="Property publishing is available to sellers and agents."
        href="/dashboard"
        label="Return to dashboard"
      />
    );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const imageUrls = getFormString(data, 'imageUrls')
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean);
      const yearBuilt = getFormString(data, 'yearBuilt');
      const property = await propertiesApi.create(token, {
        title: getFormString(data, 'title'),
        description: getFormString(data, 'description'),
        price: Number(data.get('price')),
        currency: getFormString(data, 'currency') as Currency,
        city: getFormString(data, 'city'),
        address: getFormString(data, 'address'),
        type: getFormString(data, 'type') as PropertyType,
        area: Number(data.get('area')),
        bedrooms: Number(data.get('bedrooms')),
        bathrooms: Number(data.get('bathrooms')),
        parkingSpaces: Number(data.get('parkingSpaces')),
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
        imageUrls: imageUrls.length ? imageUrls : undefined,
      });
      router.push(`/properties/${property.id}`);
    } catch (reason) {
      if (reason instanceof ApiError) {
        setError(reason.message);
        setFieldErrors(reason.fieldErrors);
      } else {
        setError('Could not publish the property. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name: string) => fieldErrors[name]?.[0];

  return (
    <form
      className="listing-form"
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <fieldset>
        <legend>Property story</legend>
        <div className="field">
          <label htmlFor="title">Listing title</label>
          <input
            id="title"
            name="title"
            minLength={5}
            maxLength={140}
            required
            placeholder="Light-filled home near the park"
          />
          {fieldError('title') && (
            <span className="field-error">{fieldError('title')}</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            minLength={20}
            maxLength={5000}
            rows={7}
            required
            placeholder="Describe the layout, light, setting, and the details that make this property distinctive."
          />
          {fieldError('description') && (
            <span className="field-error">{fieldError('description')}</span>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>Location and value</legend>
        <div className="form-row">
          <div className="field">
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              minLength={2}
              maxLength={120}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="address">Street address</label>
            <input
              id="address"
              name="address"
              minLength={5}
              maxLength={240}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              name="price"
              type="number"
              min="1"
              step="0.01"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="currency">Currency</label>
            <select id="currency" name="currency" defaultValue="USD">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="type">Property type</label>
            <select id="type" name="type" defaultValue="HOUSE">
              {[
                'HOUSE',
                'APARTMENT',
                'CONDO',
                'TOWNHOUSE',
                'LAND',
                'COMMERCIAL',
              ].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Key facts</legend>
        <div className="form-row form-row-four">
          <div className="field">
            <label htmlFor="area">Area (sq ft)</label>
            <input id="area" name="area" type="number" min="1" required />
          </div>
          <div className="field">
            <label htmlFor="bedrooms">Bedrooms</label>
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min="0"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="bathrooms">Bathrooms</label>
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min="0"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="parkingSpaces">Parking</label>
            <input
              id="parkingSpaces"
              name="parkingSpaces"
              type="number"
              min="0"
              defaultValue="0"
              required
            />
          </div>
        </div>
        <div className="field field-narrow">
          <label htmlFor="yearBuilt">
            Year built <span>(optional)</span>
          </label>
          <input
            id="yearBuilt"
            name="yearBuilt"
            type="number"
            min="1800"
            max={new Date().getFullYear() + 2}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>Photography</legend>
        <div className="field">
          <label htmlFor="imageUrls">
            HTTPS image URLs <span>(optional, one per line)</span>
          </label>
          <textarea
            id="imageUrls"
            name="imageUrls"
            rows={4}
            placeholder={
              'https://images.example.com/front.jpg\nhttps://images.example.com/kitchen.jpg'
            }
          />
          <span className="field-help">
            Use up to 12 secure, publicly accessible images. The first becomes
            the cover.
          </span>
          {fieldError('imageUrls') && (
            <span className="field-error">{fieldError('imageUrls')}</span>
          )}
        </div>
      </fieldset>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <Link className="button button-quiet" href="/dashboard">
          Cancel
        </Link>
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? 'Publishing…' : 'Publish property'}
        </button>
      </div>
    </form>
  );
}

function AccessMessage({
  title,
  href,
  label,
}: {
  title: string;
  href: string;
  label: string;
}) {
  return (
    <div className="centered-page compact-centered">
      <h2>{title}</h2>
      <Link className="button" href={href}>
        {label}
      </Link>
    </div>
  );
}
