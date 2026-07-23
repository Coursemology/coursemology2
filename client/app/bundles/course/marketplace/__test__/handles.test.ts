import { Location } from 'react-router-dom';

import { CrumbPath } from 'lib/hooks/router/dynamicNest';

import { attemptHandle, listingHandle, marketplaceHandle } from '../handles';
import { fetchListing } from '../operations';
import translations from '../translations';

// The handles always return a `{ getData }` request (never a bare title/null), so narrow the
// DataHandle union to read getData directly.
interface WithGetData<T> {
  getData: () => T;
}

jest.mock('../operations');

const asMatch = (
  pathname: string,
  params: Record<string, string> = {},
): { id: string; pathname: string; params: typeof params; data: unknown } => ({
  id: '',
  pathname,
  params,
  data: undefined,
});

const asLocation = (search: string): Location => ({
  pathname: '',
  search,
  hash: '',
  state: null,
  key: '',
});

describe('marketplaceHandle', () => {
  it('links the crumb to the marketplace path carrying from_tab', () => {
    const handle = marketplaceHandle(
      asMatch('/courses/1/marketplace'),
      asLocation('?from_tab=42'),
    ) as WithGetData<CrumbPath>;

    expect(handle.getData()).toEqual({
      content: {
        title: expect.anything(),
        url: '/courses/1/marketplace?from_tab=42',
      },
    });
  });

  it('links the crumb to the bare marketplace path when there is no from_tab', () => {
    const handle = marketplaceHandle(
      asMatch('/courses/1/marketplace'),
      asLocation(''),
    ) as WithGetData<CrumbPath>;

    expect(handle.getData()).toEqual({
      content: { title: expect.anything(), url: '/courses/1/marketplace' },
    });
  });
});

describe('listingHandle', () => {
  it('resolves the listing title and links the crumb carrying from_tab', async () => {
    (fetchListing as jest.Mock).mockResolvedValue({ title: 'Graph Theory' });

    const handle = listingHandle(
      asMatch('/courses/1/marketplace/listings/7', { listingId: '7' }),
      asLocation('?from_tab=42'),
    ) as WithGetData<Promise<CrumbPath>>;

    await expect(handle.getData()).resolves.toEqual({
      content: {
        title: 'Graph Theory',
        url: '/courses/1/marketplace/listings/7?from_tab=42',
      },
    });
  });
});

describe('attemptHandle', () => {
  it('titles the attempt crumb "Try It Out" as the terminal breadcrumb', () => {
    const handle = attemptHandle(
      asMatch('/courses/1/marketplace/listings/7/attempt', {
        listingId: '7',
      }),
      asLocation('?from_tab=42'),
    ) as WithGetData<typeof translations.tryItOutBreadcrumb>;

    expect(handle.getData()).toBe(translations.tryItOutBreadcrumb);
  });
});
