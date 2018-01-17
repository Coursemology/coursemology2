import store from '../store';

describe('store', () => {
  describe('when there is no session id', () => {
    const createdStore = store({
      video: { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      courseUserId: 1,
    });

    it('does not return a persistor', () => {
      expect(Object.keys(createdStore)).toContain('store');
      expect(Object.keys(createdStore)).not.toContain('persistor');
    });
  });

  describe('when there is a session id', () => {
    const createdStore = store({
      video: { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', sessionId: 1 },
      courseUserId: 1,
    });

    it('returns a persistor', () => {
      expect(Object.keys(createdStore)).toContain('store');
      expect(Object.keys(createdStore)).toContain('persistor');
    });
  });
});
