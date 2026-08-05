import { AuthForm } from '@/components/auth-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <section className="auth-page">
      <div className="auth-art" aria-hidden="true">
        <span>
          Find.
          <br />
          Save.
          <br />
          Visit.
        </span>
      </div>
      <div className="auth-panel">
        <div className="auth-heading">
          <span className="eyebrow">Welcome back</span>
          <h1>Pick up where you left off.</h1>
          <p>Your favorites and tour requests are waiting.</p>
        </div>
        <Suspense fallback={<p>Preparing sign in…</p>}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </section>
  );
}
