import {
  clearActivePreview,
  getActivePreview,
  setActivePreview,
} from '../previewAttemptContext';

describe('previewAttemptContext', () => {
  afterEach(() => clearActivePreview());

  it('is null by default', () => {
    expect(getActivePreview()).toBeNull();
  });

  it('returns the id after setActivePreview', () => {
    setActivePreview(42);
    expect(getActivePreview()).toBe(42);
  });

  it('returns null after clearActivePreview', () => {
    setActivePreview(42);
    clearActivePreview();
    expect(getActivePreview()).toBeNull();
  });
});
