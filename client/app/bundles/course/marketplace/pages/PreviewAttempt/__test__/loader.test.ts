import { LoaderFunctionArgs } from 'react-router-dom';

import CourseAPI from 'api/course';
import {
  clearPreviewIdentity,
  PreviewIdentity,
  resolvePreviewIdentity,
  setPreviewIdentity,
} from 'lib/helpers/previewIdentity';

import { fetchListing } from '../../../operations';
import { previewAttemptLoader } from '../loader';

jest.mock('../../../operations', () => ({ fetchListing: jest.fn() }));

const PREVIEW_PATH = '/courses/2/marketplace/listings/10/attempt';
const IDS = { courseId: 14, assessmentId: 65, submissionId: 8190 };

const run = (): Promise<unknown> =>
  previewAttemptLoader(jest.fn() as never)({
    params: { listingId: '10' },
    request: {} as Request,
  } as LoaderFunctionArgs) as Promise<unknown>;

beforeEach(() => {
  clearPreviewIdentity();
  window.history.pushState({}, '', PREVIEW_PATH);

  jest
    .spyOn(CourseAPI.marketplace, 'attempt')
    .mockResolvedValue({ data: { redirectUrl: '/ignored', ...IDS } } as never);
  (fetchListing as jest.Mock).mockResolvedValue({
    id: 10,
    title: '[MP] Grand mix',
  });
});

afterEach(() => jest.restoreAllMocks());

it('seeds the preview identity from the attempt response', async () => {
  await run();

  expect(resolvePreviewIdentity()).toEqual(IDS);
});

it('returns the listing title for the banner', async () => {
  await expect(run()).resolves.toEqual({ listingTitle: '[MP] Grand mix' });
});

// Load-bearing ordering. MarketplaceAPI builds its URLs from getCourseId(), which is shimmed on this
// very route — so if a stale identity from an earlier preview survives into these calls, they are
// addressed to the *container* course and the container lock 403s them. Clearing must happen BEFORE
// the requests go out, not merely before the new identity is set.
it('clears a stale identity before it issues either request', async () => {
  setPreviewIdentity({ courseId: 99, assessmentId: 99, submissionId: 99 });

  let identityDuringCall: PreviewIdentity | null | string = 'never called';
  jest
    .spyOn(CourseAPI.marketplace, 'attempt')
    .mockImplementation(async (): Promise<never> => {
      identityDuringCall = resolvePreviewIdentity();
      return { data: { redirectUrl: '/ignored', ...IDS } } as never;
    });

  await run();

  expect(identityDuringCall).toBeNull();
});

it('throws when the route has no listing id', async () => {
  await expect(
    previewAttemptLoader(jest.fn() as never)({
      params: {},
      request: {} as Request,
    } as LoaderFunctionArgs),
  ).rejects.toThrow();
});
