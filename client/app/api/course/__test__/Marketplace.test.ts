import {
  clearPreviewIdentity,
  setPreviewIdentity,
} from 'lib/helpers/previewIdentity';

import MarketplaceAPI from '../Marketplace';

const setPath = (pathname: string): void => {
  window.history.pushState({}, '', pathname);
};

const api = new MarketplaceAPI();

beforeEach(() => {
  clearPreviewIdentity();
  setPath('/');
});

describe('MarketplaceAPI course scoping', () => {
  // The regression this guards: on the masked attempt route the preview identity re-points
  // getCourseId() at the hidden container course — correct for the platform submission APIs the
  // preview reuses, but the breadcrumb's listing-title fetch is a *marketplace* call. Marketplace
  // endpoints only exist in the previewer's visible course, so if the marketplace client honoured
  // the shim the request would hit the container course's marketplace and be denied (403).
  it('resolves the visible URL course on the attempt route even when a preview identity is set', () => {
    setPath('/courses/2/marketplace/listings/10/attempt');
    setPreviewIdentity({ courseId: 16, assessmentId: 67, submissionId: 8192 });

    expect(api.courseId).toBe('2');
  });

  it('resolves the URL course on an ordinary marketplace page', () => {
    setPath('/courses/2/marketplace');

    expect(api.courseId).toBe('2');
  });
});
