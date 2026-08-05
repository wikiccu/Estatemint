import { PropertyExplorer } from '@/components/property-explorer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore homes',
  description:
    'Search active EstateMint properties by location, type, price, and size.',
};

export default function PropertiesPage() {
  return (
    <section className="shell page-section">
      <div className="page-intro">
        <span className="eyebrow">Find your fit</span>
        <h1>Homes with something to say.</h1>
        <p>
          Search the current collection, then save the places you want to see
          again.
        </p>
      </div>
      <PropertyExplorer />
    </section>
  );
}
