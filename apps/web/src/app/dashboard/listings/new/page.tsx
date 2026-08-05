import { ListingForm } from '@/components/listing-form';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Publish a property' };

export default function NewListingPage() {
  return (
    <section className="shell page-section form-page">
      <Link className="back-link" href="/dashboard">
        ← Back to dashboard
      </Link>
      <div className="page-intro">
        <span className="eyebrow">Add to the marketplace</span>
        <h1>Present the property clearly.</h1>
        <p>
          Accurate details and a useful description help buyers decide whether a
          visit is worthwhile.
        </p>
      </div>
      <ListingForm />
    </section>
  );
}
