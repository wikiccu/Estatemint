'use client';

import { useAuth } from '@/components/auth-provider';
import { Notice } from '@/components/notice';
import { PropertyCard } from '@/components/property-card';
import {
  ApiError,
  appointmentsApi,
  favoritesApi,
  propertiesApi,
} from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { propertyDetailsHref } from '@/lib/routes';
import type { Appointment, Property } from '@/types/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const listingRoles = ['SELLER', 'AGENT', 'ADMIN'];

export function Dashboard() {
  const { user, token, isLoading, logout } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [listings, setListings] = useState<Property[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const requests: Promise<unknown>[] = [
      favoritesApi.list(token).then(setFavorites),
      appointmentsApi.list(token).then(setAppointments),
    ];
    if (listingRoles.includes(user.role))
      requests.push(propertiesApi.mine(token).then(setListings));

    Promise.all(requests)
      .catch((reason: unknown) => {
        if (reason instanceof ApiError && reason.status === 401) logout();
        else
          setError(
            reason instanceof ApiError
              ? reason.message
              : 'Dashboard data is unavailable.',
          );
      })
      .finally(() => setLoadingData(false));
  }, [logout, token, user]);

  const archiveListing = async (property: Property) => {
    if (
      !token ||
      !window.confirm(
        `Archive “${property.title}”? It will disappear from public search.`,
      )
    )
      return;
    try {
      const archived = await propertiesApi.archive(token, property.id);
      setListings((current) =>
        current.map((item) => (item.id === archived.id ? archived : item)),
      );
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : 'Could not archive the listing.',
      );
    }
  };

  if (isLoading)
    return (
      <div className="shell page-loading">
        <span className="spinner" />
        <p>Checking your account…</p>
      </div>
    );

  if (!user || !token) {
    return (
      <section className="shell centered-page">
        <span className="eyebrow">Your EstateMint space</span>
        <h1>Sign in to open your dashboard.</h1>
        <p>Keep favorites, tour requests, and listings together.</p>
        <Link className="button" href="/login?next=/dashboard">
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <section className="shell page-section dashboard">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Your EstateMint</span>
          <h1>Good to see you, {user.firstName}.</h1>
          <p>
            {user.email} ·{' '}
            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
          </p>
        </div>
        {listingRoles.includes(user.role) && (
          <Link className="button button-light" href="/dashboard/listings/new">
            Publish a property
          </Link>
        )}
      </div>

      {error && (
        <Notice title="Some dashboard data could not load" tone="error">
          {error}
        </Notice>
      )}
      {loadingData ? (
        <div className="page-loading compact-loading">
          <span className="spinner" />
          <p>Gathering your activity…</p>
        </div>
      ) : (
        <>
          <section className="dashboard-section">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">Shortlist</span>
                <h2>Saved homes</h2>
              </div>
              <span>{favorites.length} saved</span>
            </div>
            {favorites.length ? (
              <div className="property-grid">
                {favorites.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <Notice title="Your shortlist is open">
                Save any property to keep it close for later.
              </Notice>
            )}
          </section>

          <section className="dashboard-section">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">Calendar</span>
                <h2>Tour requests</h2>
              </div>
              <span>{appointments.length} total</span>
            </div>
            {appointments.length ? (
              <div className="appointment-list">
                {appointments.map((appointment) => (
                  <article key={appointment.id}>
                    <div>
                      <span
                        className={`status-pill status-${appointment.status.toLowerCase()}`}
                      >
                        {appointment.status}
                      </span>
                      <h3>
                        <Link
                          href={propertyDetailsHref(appointment.property.id)}
                        >
                          {appointment.property.title}
                        </Link>
                      </h3>
                      <p>
                        {appointment.property.city} ·{' '}
                        {appointment.property.address}
                      </p>
                    </div>
                    <time dateTime={appointment.scheduledAt}>
                      {formatDateTime(appointment.scheduledAt)}
                    </time>
                  </article>
                ))}
              </div>
            ) : (
              <Notice title="No tours requested">
                When a home catches your eye, request a time from its detail
                page.
              </Notice>
            )}
          </section>

          {listingRoles.includes(user.role) && (
            <section className="dashboard-section">
              <div className="section-heading split-heading">
                <div>
                  <span className="eyebrow">Portfolio</span>
                  <h2>Your listings</h2>
                </div>
                <span>{listings.length} total</span>
              </div>
              {listings.length ? (
                <div className="listing-table">
                  {listings.map((property) => (
                    <article key={property.id}>
                      <div>
                        <span
                          className={`status-pill status-${property.status.toLowerCase()}`}
                        >
                          {property.status}
                        </span>
                        <h3>{property.title}</h3>
                        <p>
                          {property.city} · {property.favoriteCount} saves
                        </p>
                      </div>
                      {property.status !== 'ARCHIVED' && (
                        <button
                          className="text-button danger-button"
                          type="button"
                          onClick={() => {
                            void archiveListing(property);
                          }}
                        >
                          Archive
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <Notice title="No listings yet">
                  Publish your first property to make it discoverable in the
                  marketplace.
                </Notice>
              )}
            </section>
          )}
        </>
      )}
    </section>
  );
}
