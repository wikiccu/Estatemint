'use client';

import { useAuth } from '@/components/auth-provider';
import { Notice } from '@/components/notice';
import {
  ApiError,
  appointmentsApi,
  favoritesApi,
  propertiesApi,
} from '@/lib/api';
import { formatPrice, formatPropertyType } from '@/lib/format';
import { getFormString } from '@/lib/form-data';
import { propertyDetailsHref } from '@/lib/routes';
import type { Property } from '@/types/api';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

export function PropertyDetail({ id }: { id: string }) {
  const { token, user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [touring, setTouring] = useState(false);
  const detailsHref = propertyDetailsHref(id);

  useEffect(() => {
    const controller = new AbortController();
    propertiesApi
      .get(id, controller.signal)
      .then(setProperty)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof ApiError
              ? reason.message
              : 'Property unavailable.',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!token) return;
    favoritesApi
      .list(token)
      .then((items) => setFavorite(items.some((item) => item.id === id)))
      .catch(() => undefined);
  }, [id, token]);

  const toggleFavorite = async () => {
    if (!token) return;
    setSaving(true);
    setActionError(null);
    try {
      if (favorite) await favoritesApi.remove(token, id);
      else await favoritesApi.add(token, id);
      setFavorite((value) => !value);
    } catch (reason) {
      setActionError(
        reason instanceof ApiError
          ? reason.message
          : 'Could not update your favorites.',
      );
    } finally {
      setSaving(false);
    }
  };

  const requestTour = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setTouring(true);
    setActionError(null);
    setActionMessage(null);
    try {
      await appointmentsApi.create(token, {
        propertyId: id,
        scheduledAt: new Date(getFormString(data, 'scheduledAt')).toISOString(),
        message: getFormString(data, 'message') || undefined,
      });
      setActionMessage('Tour requested. You can track it from your dashboard.');
      form.reset();
    } catch (reason) {
      setActionError(
        reason instanceof ApiError
          ? reason.message
          : 'Could not request the tour.',
      );
    } finally {
      setTouring(false);
    }
  };

  if (loading)
    return (
      <div className="shell page-loading">
        <span className="spinner" />
        <p>Opening the property…</p>
      </div>
    );
  if (error || !property)
    return (
      <section className="shell page-section">
        <Notice title="This home is unavailable" tone="error">
          {error || 'The listing may no longer be active.'}
        </Notice>
      </section>
    );

  return (
    <section className="shell page-section property-detail">
      <Link className="back-link" href="/properties">
        ← Back to all homes
      </Link>
      <div className="detail-gallery">
        <div className="detail-primary-image">
          {property.images[0] ? (
            <img
              src={property.images[0].url}
              alt={property.images[0].alt || property.title}
            />
          ) : (
            <span className="property-placeholder">
              <span>EM</span>
            </span>
          )}
        </div>
        <div className="detail-gallery-side">
          {property.images.slice(1, 3).map((image) => (
            <img
              src={image.url}
              alt={image.alt || property.title}
              key={image.id}
            />
          ))}
          {property.images.length < 2 && (
            <div className="gallery-tone gallery-tone-one" />
          )}
          {property.images.length < 3 && (
            <div className="gallery-tone gallery-tone-two" />
          )}
        </div>
      </div>
      <div className="detail-layout">
        <article>
          <div className="detail-title-row">
            <div>
              <span className="eyebrow">
                {formatPropertyType(property.type)} · {property.city}
              </span>
              <h1>{property.title}</h1>
              <p>{property.address}</p>
            </div>
            <strong className="detail-price">
              {formatPrice(property.price, property.currency)}
            </strong>
          </div>
          <ul className="detail-facts">
            <li>
              <strong>{property.bedrooms}</strong>
              <span>Bedrooms</span>
            </li>
            <li>
              <strong>{property.bathrooms}</strong>
              <span>Bathrooms</span>
            </li>
            <li>
              <strong>{property.area.toLocaleString()}</strong>
              <span>Square feet</span>
            </li>
            <li>
              <strong>{property.parkingSpaces}</strong>
              <span>Parking</span>
            </li>
          </ul>
          <div className="detail-copy">
            <h2>About this home</h2>
            <p>{property.description}</p>
          </div>
          <div className="detail-copy detail-meta-grid">
            <div>
              <span>Listed by</span>
              <strong>
                {property.owner.firstName} {property.owner.lastName}
              </strong>
            </div>
            <div>
              <span>Year built</span>
              <strong>{property.yearBuilt || 'Not specified'}</strong>
            </div>
            <div>
              <span>Interest</span>
              <strong>
                {property.favoriteCount}{' '}
                {property.favoriteCount === 1 ? 'save' : 'saves'}
              </strong>
            </div>
          </div>
        </article>
        <aside className="action-card">
          <span className="eyebrow">Make your move</span>
          <h2>See it in person.</h2>
          {!token ? (
            <>
              <p>Sign in to save this home or request a private tour.</p>
              <Link
                className="button button-block"
                href={`/login?next=${encodeURIComponent(detailsHref)}`}
              >
                Sign in to continue
              </Link>
            </>
          ) : user?.id === property.ownerId ? (
            <Notice title="This is your listing">
              Manage it from your dashboard.
            </Notice>
          ) : (
            <>
              <button
                className="button button-block button-quiet"
                type="button"
                disabled={saving}
                onClick={() => {
                  void toggleFavorite();
                }}
              >
                {saving
                  ? 'Updating…'
                  : favorite
                    ? 'Remove from favorites'
                    : 'Save to favorites'}
              </button>
              <form
                className="tour-form"
                onSubmit={(event) => {
                  void requestTour(event);
                }}
              >
                <div className="field">
                  <label htmlFor="scheduledAt">Preferred tour time</label>
                  <input
                    id="scheduledAt"
                    name="scheduledAt"
                    type="datetime-local"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="message">
                    Note for the agent <span>(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    maxLength={1000}
                    placeholder="Share any timing or access details."
                  />
                </div>
                <button
                  className="button button-block"
                  type="submit"
                  disabled={touring}
                >
                  {touring ? 'Sending request…' : 'Request a tour'}
                </button>
              </form>
            </>
          )}
          {actionError && (
            <p className="form-error" role="alert">
              {actionError}
            </p>
          )}
          {actionMessage && (
            <p className="form-success" role="status">
              {actionMessage}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
