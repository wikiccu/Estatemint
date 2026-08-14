import { formatPrice, formatPropertyType } from '@/lib/format';
import { propertyDetailsHref } from '@/lib/routes';
import type { Property } from '@/types/api';
import Link from 'next/link';

export function PropertyCard({ property }: { property: Property }) {
  const image = property.images[0];
  const detailsHref = propertyDetailsHref(property.id);

  return (
    <article className="property-card">
      <Link className="property-media" href={detailsHref}>
        {image ? (
          <img
            src={image.url}
            alt={image.alt || `${property.title} in ${property.city}`}
          />
        ) : (
          <span className="property-placeholder" aria-hidden="true">
            <span>EM</span>
          </span>
        )}
        <span className="property-type">
          {formatPropertyType(property.type)}
        </span>
      </Link>
      <div className="property-card-body">
        <div className="property-price">
          {formatPrice(property.price, property.currency)}
        </div>
        <h3>
          <Link href={detailsHref}>{property.title}</Link>
        </h3>
        <p>
          {property.city} · {property.address}
        </p>
        <ul className="property-facts" aria-label="Property facts">
          <li>
            <strong>{property.bedrooms}</strong> bd
          </li>
          <li>
            <strong>{property.bathrooms}</strong> ba
          </li>
          <li>
            <strong>{property.area.toLocaleString()}</strong> sq ft
          </li>
        </ul>
      </div>
    </article>
  );
}
