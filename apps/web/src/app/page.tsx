import { FeaturedProperties } from '@/components/featured-properties';
import Link from 'next/link';

const trustPoints = [
  [
    '01',
    'Useful detail, upfront',
    'Key facts, ownership context, and clear pricing stay close at hand.',
  ],
  [
    '02',
    'A shortlist that follows you',
    'Save the homes that feel right and compare them from one calm workspace.',
  ],
  [
    '03',
    'Tours without the telephone tag',
    'Request a visit directly from a listing and track it from your dashboard.',
  ],
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">A more considered property search</span>
            <h1>
              Find a place
              <br />
              worth moving for.
            </h1>
            <p>
              EstateMint brings the important details into focus, so your next
              move begins with clarity instead of clutter.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/properties">
                Explore homes
              </Link>
              <Link className="text-link arrow-link" href="/register">
                Create your shortlist <span>→</span>
              </Link>
            </div>
          </div>
          <div
            className="hero-composition"
            aria-label="EstateMint property discovery preview"
          >
            <div className="hero-card hero-card-main">
              <span className="hero-card-label">New to the market</span>
              <div className="hero-card-art" aria-hidden="true">
                <span className="window window-one" />
                <span className="window window-two" />
                <span className="terrace" />
              </div>
              <div className="hero-card-meta">
                <span>Distinctive homes</span>
                <strong>Curated for real life</strong>
              </div>
            </div>
            <div className="hero-note">
              <span>Search signal</span>
              <strong>
                Less noise.
                <br />
                Better fits.
              </strong>
            </div>
            <div className="hero-orbit" aria-hidden="true">
              12
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="EstateMint principles">
        <div className="shell trust-grid">
          <span>Built for</span>
          <strong>Buyers</strong>
          <strong>Sellers</strong>
          <strong>Agents</strong>
          <strong>Clear decisions</strong>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">Fresh addresses</span>
            <h2>Start somewhere promising.</h2>
          </div>
          <p>Recently published homes from the EstateMint marketplace.</p>
        </div>
        <FeaturedProperties />
      </section>

      <section className="section section-dark">
        <div className="shell">
          <div className="section-heading section-heading-light">
            <span className="eyebrow">The EstateMint difference</span>
            <h2>
              A property search should feel
              <br />
              like progress.
            </h2>
          </div>
          <div className="principles-grid">
            {trustPoints.map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell section callout">
        <div>
          <span className="eyebrow">Ready when you are</span>
          <h2>Your next address is a search away.</h2>
        </div>
        <Link className="button button-light" href="/properties">
          Browse the marketplace
        </Link>
      </section>
    </>
  );
}
