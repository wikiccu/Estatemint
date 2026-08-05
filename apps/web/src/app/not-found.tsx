import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="shell centered-page">
      <span className="eyebrow">404 · Address not found</span>
      <h1>This page has moved on.</h1>
      <p>The property or page you requested is not available.</p>
      <Link className="button" href="/properties">
        Explore available homes
      </Link>
    </section>
  );
}
