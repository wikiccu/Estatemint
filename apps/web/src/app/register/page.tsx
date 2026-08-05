import { AuthForm } from '@/components/auth-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Create an account' };

export default function RegisterPage() {
  return (
    <section className="auth-page">
      <div className="auth-art auth-art-register" aria-hidden="true">
        <span>
          A shortlist
          <br />
          with purpose.
        </span>
      </div>
      <div className="auth-panel">
        <div className="auth-heading">
          <span className="eyebrow">Join EstateMint</span>
          <h1>Make the search yours.</h1>
          <p>
            Save promising places and arrange tours from one simple dashboard.
          </p>
        </div>
        <Suspense fallback={<p>Preparing registration…</p>}>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </section>
  );
}
