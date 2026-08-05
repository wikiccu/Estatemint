'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="shell centered-page">
      <span className="eyebrow">Something went wrong</span>
      <h1>We couldn&apos;t open this view.</h1>
      <p>Please try again. Your account and saved properties are unchanged.</p>
      <button className="button" type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
