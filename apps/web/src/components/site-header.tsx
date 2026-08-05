'use client';

import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Explore homes' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link className="brand" href="/" aria-label="EstateMint home">
          <span className="brand-mark" aria-hidden="true">
            E
          </span>
          <span>EstateMint</span>
        </Link>
        <nav className="primary-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href))
                  ? 'page'
                  : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link className="mobile-explore text-link" href="/properties">
            Explore
          </Link>
          {isLoading ? (
            <span className="nav-status" aria-label="Checking account">
              •••
            </span>
          ) : user ? (
            <>
              <Link
                className="button button-small button-quiet"
                href="/dashboard"
              >
                {user.firstName}&apos;s dashboard
              </Link>
              <button className="text-button" type="button" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="text-link" href="/login">
                Sign in
              </Link>
              <Link className="button button-small" href="/register">
                Join EstateMint
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
