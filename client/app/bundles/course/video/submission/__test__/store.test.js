import { playerStates } from 'lib/constants/videoConstants';
import store from '../store';
import { changePlayerState, updatePlayerProgress } from '../actions/video';

const videoStateObject = {
  videoUrl: 'https://www.youtube.com/watch?v=sTSA_sWGM44',
  watchNextVideoUrl: '',
  nextVideoSubmissionExists: false,
  playerState: 'PLAYING',
  playerProgress: 10,
  duration: 295,
  bufferProgress: 20,
  playerVolume: 0.8,
  playbackRate: 1,
  restrictContentAfter: null,
  forceSeek: false,
  sessionId: '50',
  sessionSequenceNum: 1,
  sessionEvents: [{ sequence_num: 0, event_type: 'play', video_time: 0, playback_rate: 1, event_time: Date.now() }],
  sessionClosed: false,
};

const videoStateFixture = JSON.stringify(videoStateObject);
const closedVideoStateFixture = JSON.stringify({ ...videoStateObject, sessionClosed: true });

const oldSessionsFixture = JSON.stringify({
  25: {
    videoUrl: 'https://www.youtube.com/watch?v=hSVNbxjdvv8',
    watchNextVideoUrl: '',
    nextVideoSubmissionExists: false,
    playerState: 'PAUSED',
    playerProgress: 5,
    duration: 164,
    bufferProgress: 15,
    playerVolume: 0.8,
    playbackRate: 1,
    restrictContentAfter: null,
    forceSeek: false,
    sessionId: '25',
    sessionSequenceNum: 2,
    sessionEvents: [
      { sequence_num: 0, event_type: 'play', video_time: 0, playback_rate: 1, event_time: Date.now() },
      { sequence_num: 1, event_type: 'pause', video_time: 5, playback_rate: 1, event_time: Date.now() },
    ],
    sessionClosed: false,
  },
});

function createStore(courseUserId = '1', sessionId = '1') {
  return store({
    video: { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', sessionId },
    courseUserId,
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe('persistor', () => {
  describe('when there is no session id', () => {
    const createdStore = createStore('1', null);
    it('does not return a persistor', () => {
      expect(Object.keys(createdStore)).toContain('store');
      expect(Object.keys(createdStore)).not.toContain('persistor');
    });
  });

  describe('when there is a session id', () => {
    const createdStore = createStore();
    it('returns a persistor', () => {
      expect(Object.keys(createdStore)).toContain('store');
      expect(Object.keys(createdStore)).toContain('persistor');
    });

    describe('when a video state change occurs', () => {
      it('persists the state to localStorage', async () => {
        createdStore.store.dispatch(changePlayerState(playerStates.PLAYING));
        createdStore.store.dispatch(updatePlayerProgress(13));
        createdStore.persistor.flush();

        expect(localStorage.setItem).toHaveBeenCalled();
        const persistedState = JSON.parse(localStorage.__STORE__['persist:videoWatchSessionStore:user-1']);
        expect(persistedState).toHaveProperty('video');
        const videoState = JSON.parse(persistedState.video);
        expect(videoState.playerProgress).toBe(13);
        expect(videoState.playerState).toBe(playerStates.PLAYING);
        expect(videoState.sessionSequenceNum).toBe(1);
        expect(videoState.sessionEvents).toHaveLength(1);
      });
    });
  });
});

describe('store', () => {
  describe('when no locally stored state exist', () => {
    it('initializes the video state only', async () => {
      const createdStore = createStore();
      await sleep(0.5); // Wait for state to restore

      const state = createdStore.store.getState();
      const newVideoState = state.video;
      expect(newVideoState.videoUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(newVideoState.sessionId).toBe('1');
      expect(newVideoState.playerState).toBe('UNSTARTED');
      expect(newVideoState.playerProgress).toBe(0);
      expect(newVideoState.sessionSequenceNum).toBe(0);

      expect(state.oldSessions.count()).toBe(0);
    });
  });

  describe('when old video state exists', () => {
    beforeEach(() => {
      localStorage.setItem('persist:videoWatchSessionStore:user-1', JSON.stringify({ video: videoStateFixture }));
    });

    it('appends old video state into oldSessions', async () => {
      const createdStore = createStore();
      await sleep(0.5); // Wait for state to restore

      const state = createdStore.store.getState();
      const newVideoState = state.video;
      expect(newVideoState.videoUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(newVideoState.sessionId).toBe('1');
      expect(newVideoState.playerState).toBe(playerStates.UNSTARTED);
      expect(newVideoState.playerProgress).toBe(0);
      expect(newVideoState.sessionSequenceNum).toBe(0);

      expect(state.oldSessions.count()).toBe(1);
      expect(state.oldSessions.has('50')).toBeTruthy();
      const oldVideoState = state.oldSessions.get('50');
      expect(oldVideoState.videoUrl).toBe('https://www.youtube.com/watch?v=sTSA_sWGM44');
      expect(oldVideoState.sessionId).toBe('50');
      expect(oldVideoState.playerState).toBe(playerStates.PLAYING);
      expect(oldVideoState.playerProgress).toBe(10);
      expect(oldVideoState.sessionSequenceNum).toBe(1);
      expect(oldVideoState.sessionEvents.count()).toBe(1);
      const oldEvent = oldVideoState.sessionEvents.first();
      expect(oldEvent.event_type).toBe('play');
      expect(oldEvent.sequence_num).toBe(0);
      expect(oldEvent.video_time).toBe(0);
    });
  });

  describe('when other oldSessions exists in storage', () => {
    beforeEach(() => {
      localStorage.setItem('persist:videoWatchSessionStore:user-1', JSON.stringify({
        video: videoStateFixture,
        oldSessions: oldSessionsFixture,
      }));
    });

    it('does not interfere with the existing sessions', async () => {
      const createdStore = createStore();
      await sleep(0.5); // Wait for state to restore

      const state = createdStore.store.getState();
      const newVideoState = state.video;
      expect(newVideoState.videoUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(newVideoState.sessionId).toBe('1');
      expect(newVideoState.playerState).toBe(playerStates.UNSTARTED);
      expect(newVideoState.playerProgress).toBe(0);
      expect(newVideoState.sessionSequenceNum).toBe(0);

      expect(state.oldSessions.count()).toBe(2);

      expect(state.oldSessions.has('50')).toBeTruthy();
      const oldVideoStateAdded = state.oldSessions.get('50');
      expect(oldVideoStateAdded.videoUrl).toBe('https://www.youtube.com/watch?v=sTSA_sWGM44');
      expect(oldVideoStateAdded.sessionId).toBe('50');
      expect(oldVideoStateAdded.playerState).toBe(playerStates.PLAYING);
      expect(oldVideoStateAdded.playerProgress).toBe(10);
      expect(oldVideoStateAdded.sessionSequenceNum).toBe(1);
      expect(oldVideoStateAdded.sessionEvents.count()).toBe(1);
      const oldEvent0 = oldVideoStateAdded.sessionEvents.first();
      expect(oldEvent0.event_type).toBe('play');
      expect(oldEvent0.sequence_num).toBe(0);
      expect(oldEvent0.video_time).toBe(0);

      expect(state.oldSessions.has('25')).toBeTruthy();
      const oldVideoStateOriginal = state.oldSessions.get('25');
      expect(oldVideoStateOriginal.videoUrl).toBe('https://www.youtube.com/watch?v=hSVNbxjdvv8');
      expect(oldVideoStateOriginal.sessionId).toBe('25');
      expect(oldVideoStateOriginal.playerState).toBe(playerStates.PAUSED);
      expect(oldVideoStateOriginal.playerProgress).toBe(5);
      expect(oldVideoStateOriginal.sessionSequenceNum).toBe(2);
      expect(oldVideoStateOriginal.sessionEvents.count()).toBe(2);

      const oldEvent1 = oldVideoStateOriginal.sessionEvents.get(0);
      expect(oldEvent1.event_type).toBe('play');
      expect(oldEvent1.sequence_num).toBe(0);
      expect(oldEvent1.video_time).toBe(0);
      const oldEvent2 = oldVideoStateOriginal.sessionEvents.get(1);
      expect(oldEvent2.event_type).toBe('pause');
      expect(oldEvent2.sequence_num).toBe(1);
      expect(oldEvent2.video_time).toBe(5);
    });
  });

  describe('when old session belongs to another user', () => {
    beforeEach(() => {
      localStorage.setItem('persist:videoWatchSessionStore:user-1', JSON.stringify({
        video: videoStateFixture,
        oldSessions: oldSessionsFixture,
      }));
    });

    it('ignores the stored state', async () => {
      const createdStore = createStore('2');
      await sleep(0.5); // Wait for state to restore

      const state = createdStore.store.getState();
      const newVideoState = state.video;
      expect(newVideoState.videoUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(newVideoState.sessionId).toBe('1');
      expect(newVideoState.playerState).toBe(playerStates.UNSTARTED);
      expect(newVideoState.playerProgress).toBe(0);
      expect(newVideoState.sessionSequenceNum).toBe(0);

      expect(state.oldSessions.count()).toBe(0);
    });
  });

  describe('when old video session is closed', () => {
    beforeEach(() => {
      localStorage.setItem('persist:videoWatchSessionStore:user-1', JSON.stringify({
        video: closedVideoStateFixture,
        oldSessions: oldSessionsFixture,
      }));
    });

    it('does not append video state to oldSessions', async () => {
      const createdStore = createStore();
      await sleep(0.5); // Wait for state to restore

      const state = createdStore.store.getState();
      const newVideoState = state.video;
      expect(newVideoState.videoUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(newVideoState.sessionId).toBe('1');
      expect(newVideoState.playerState).toBe(playerStates.UNSTARTED);
      expect(newVideoState.playerProgress).toBe(0);
      expect(newVideoState.sessionSequenceNum).toBe(0);

      expect(state.oldSessions.count()).toBe(1);
      expect(state.oldSessions.has('25')).toBeTruthy();
      const oldVideoStateOriginal = state.oldSessions.get('25');
      expect(oldVideoStateOriginal.videoUrl).toBe('https://www.youtube.com/watch?v=hSVNbxjdvv8');
      expect(oldVideoStateOriginal.sessionId).toBe('25');
      expect(oldVideoStateOriginal.playerState).toBe(playerStates.PAUSED);
      expect(oldVideoStateOriginal.playerProgress).toBe(5);
      expect(oldVideoStateOriginal.sessionSequenceNum).toBe(2);
      expect(oldVideoStateOriginal.sessionEvents.count()).toBe(2);

      const oldEvent1 = oldVideoStateOriginal.sessionEvents.get(0);
      expect(oldEvent1.event_type).toBe('play');
      expect(oldEvent1.sequence_num).toBe(0);
      expect(oldEvent1.video_time).toBe(0);
      const oldEvent2 = oldVideoStateOriginal.sessionEvents.get(1);
      expect(oldEvent2.event_type).toBe('pause');
      expect(oldEvent2.sequence_num).toBe(1);
      expect(oldEvent2.video_time).toBe(5);
    });
  });
});
