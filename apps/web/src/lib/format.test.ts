import { describe, expect, it } from 'vitest';
import { formatPrice, formatPropertyType } from './format';

describe('format helpers', () => {
  it('formats property types for people', () => {
    expect(formatPropertyType('TOWNHOUSE')).toBe('Townhouse');
  });

  it('formats prices with their currency', () => {
    expect(formatPrice('425000.00', 'USD')).toContain('$425,000');
  });
});
