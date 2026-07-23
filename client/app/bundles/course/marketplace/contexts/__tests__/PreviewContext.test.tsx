import { renderHook } from '@testing-library/react';

import {
  getActivePreview,
  PreviewContextValue,
  PreviewProvider,
  setActivePreview,
  usePreviewContext,
} from '../PreviewContext';

describe('PreviewContext', () => {
  // activePreview is module-scoped mutable state (not React state); reset it so a value set by one
  // test cannot leak a stale preview scope into the next (or into non-preview submissions).
  afterEach(() => setActivePreview(null));

  const scope: Omit<PreviewContextValue, 'isPreview'> = {
    courseId: 5,
    assessmentId: 9,
    submissionId: 42,
  };
  const previewWrapper = ({ children }): JSX.Element => (
    <PreviewProvider
      assessmentId={scope.assessmentId}
      courseId={scope.courseId}
      submissionId={scope.submissionId}
    >
      {children}
    </PreviewProvider>
  );

  it('returns null outside a provider (chrome keeps real course)', () => {
    const { result } = renderHook(() => usePreviewContext());
    expect(result.current).toBeNull();
  });

  it('supplies scoped ids inside the provider', () => {
    const { result } = renderHook(() => usePreviewContext(), {
      wrapper: previewWrapper,
    });
    expect(result.current).toEqual({ ...scope, isPreview: true });
  });

  it('mirrors the scope into the module accessor on mount, and clears it on unmount (so the class-based Submissions API, T11, can read it)', () => {
    const { unmount } = renderHook(() => usePreviewContext(), {
      wrapper: previewWrapper,
    });

    expect(getActivePreview()).toEqual({ ...scope, isPreview: true });

    unmount();

    expect(getActivePreview()).toBeNull();
  });

  describe('setActivePreview / getActivePreview (module accessor the API layer reads)', () => {
    const value: PreviewContextValue = {
      courseId: 5,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    };

    it('returns null before any value is set', () => {
      expect(getActivePreview()).toBeNull();
    });

    it('returns the value passed to setActivePreview', () => {
      setActivePreview(value);
      expect(getActivePreview()).toEqual(value);
    });

    it('clears the active preview when set to null', () => {
      setActivePreview(value);
      expect(getActivePreview()).toEqual(value);
      setActivePreview(null);
      expect(getActivePreview()).toBeNull();
    });
  });
});
