import { readFromTab, withFromTab } from '../fromTab';

describe('withFromTab', () => {
  it('appends from_tab as the first query param when the path has none', () => {
    expect(withFromTab('/courses/1/marketplace', '42')).toBe(
      '/courses/1/marketplace?from_tab=42',
    );
  });

  it('appends from_tab with & when the path already has a query string', () => {
    expect(withFromTab('/p/1?foo=bar', '42')).toBe('/p/1?foo=bar&from_tab=42');
  });

  it('returns the path unchanged when from_tab is null', () => {
    expect(withFromTab('/courses/1/marketplace', null)).toBe(
      '/courses/1/marketplace',
    );
  });
});

describe('readFromTab', () => {
  it('extracts from_tab from a search string', () => {
    expect(readFromTab('?from_tab=42&x=1')).toBe('42');
  });

  it('returns null when from_tab is absent', () => {
    expect(readFromTab('?x=1')).toBeNull();
  });
});
