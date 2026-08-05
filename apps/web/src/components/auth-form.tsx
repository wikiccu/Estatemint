'use client';

import { useAuth } from '@/components/auth-provider';
import { ApiError } from '@/lib/api';
import { getFormString } from '@/lib/form-data';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const email = getFormString(data, 'email');
      const password = getFormString(data, 'password');
      if (mode === 'register') {
        await register({
          email,
          password,
          firstName: getFormString(data, 'firstName'),
          lastName: getFormString(data, 'lastName'),
        });
      } else {
        await login(email, password);
      }

      const destination = searchParams.get('next');
      router.replace(
        destination?.startsWith('/') && !destination.startsWith('//')
          ? destination
          : '/dashboard',
      );
    } catch (reason) {
      if (reason instanceof ApiError) {
        setError(reason.message);
        setFieldErrors(reason.fieldErrors);
      } else {
        setError('We could not complete your request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name: string) => fieldErrors[name]?.[0];

  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        void submit(event);
      }}
      noValidate
    >
      {mode === 'register' && (
        <div className="form-row">
          <div className="field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              minLength={1}
              maxLength={80}
              required
              aria-describedby={
                fieldError('firstName') ? 'firstName-error' : undefined
              }
            />
            {fieldError('firstName') && (
              <span className="field-error" id="firstName-error">
                {fieldError('firstName')}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              minLength={1}
              maxLength={80}
              required
              aria-describedby={
                fieldError('lastName') ? 'lastName-error' : undefined
              }
            />
            {fieldError('lastName') && (
              <span className="field-error" id="lastName-error">
                {fieldError('lastName')}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          aria-describedby={fieldError('email') ? 'email-error' : undefined}
        />
        {fieldError('email') && (
          <span className="field-error" id="email-error">
            {fieldError('email')}
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={
            mode === 'register' ? 'new-password' : 'current-password'
          }
          minLength={mode === 'register' ? 8 : 1}
          maxLength={128}
          required
          aria-describedby={
            fieldError('password')
              ? 'password-error'
              : mode === 'register'
                ? 'password-help'
                : undefined
          }
        />
        {mode === 'register' && !fieldError('password') && (
          <span className="field-help" id="password-help">
            Use 8+ characters with upper and lowercase letters and a number.
          </span>
        )}
        {fieldError('password') && (
          <span className="field-error" id="password-error">
            {fieldError('password')}
          </span>
        )}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="button button-block"
        type="submit"
        disabled={submitting}
      >
        {submitting
          ? 'One moment…'
          : mode === 'register'
            ? 'Create my account'
            : 'Sign in'}
      </button>
      <p className="auth-switch">
        {mode === 'register'
          ? 'Already have an account?'
          : 'New to EstateMint?'}{' '}
        <Link href={mode === 'register' ? '/login' : '/register'}>
          {mode === 'register' ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </form>
  );
}
