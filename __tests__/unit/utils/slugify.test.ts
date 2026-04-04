import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/utils/slugify';

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('foo---bar')).toBe('foo-bar');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('-foo-bar-')).toBe('foo-bar');
  });

  it('handles underscores', () => {
    expect(slugify('foo_bar_baz')).toBe('foo-bar-baz');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles product name with Urdu transliteration', () => {
    expect(slugify('Premium Cotton Kurta - Summer Collection')).toBe('premium-cotton-kurta-summer-collection');
  });
});
