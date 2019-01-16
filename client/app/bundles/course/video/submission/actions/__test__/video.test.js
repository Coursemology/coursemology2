import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import { List as makeImmutableList, Map as makeImmutableMap } from 'immutable';
import store from '../../store';
import { changePlayerState, endSession, sendEvents } from '../video';
import { playerStates } from '../../../../../../lib/constants/videoConstants';

const videoId = '1';

const client = CourseAPI.video.sessions.getClient();
const mock = new MockAdapter(client, { delayResponse: 0 });

const oldSessionsFixtures = makeImmutableMap({
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
    sessionEvents: makeImmutableList([
      { sequence_num: 0, event_type: 'play', video_time: 0, playback_rate: 1, event_time: Date.now() },
      { sequence_num: 1, event_type: 'pause', video_time: 5, playback_rate: 1, event_time: Date.now() },
    ]),
    sessionClosed: false,
  },
});

beforeAll(() => {
  window.history.pushState({}, '', `/courses/${courseId}/videos/${videoId}/submissions/1/edit`);
});

beforeEach(() => {
  mock.reset();
  mock.onPatch(`/courses/${courseId}/videos/${videoId}/submissions/1/sessions/32`).reply(200);
  mock.onPatch(`/courses/${courseId}/videos/${videoId}/submissions/1/sessions/25`).reply(200);
});

function createStore(oldSessions = {}) {
  return store({
    video: { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', sessionId: 32, videoId },
    oldSessions,
    courseUserId: 100,
  });
}

describe('sendEvents', () => {
  it('sends back old sessions', async () => {
    const createdStore = createStore(oldSessionsFixtures).store;
    const spyUpdate = jest.spyOn(CourseAPI.video.sessions, 'update');
    createdStore.dispatch(sendEvents());

    expect(spyUpdate).toHaveBeenCalledWith('25', 5, oldSessionsFixtures.get('25').sessionEvents.toArray(), 0, true, true);
    await sleep(1);
    expect(createdStore.getState().oldSessions.count()).toBe(0);
  });

  it('sends back current events', async () => {
    const createdStore = createStore().store;
    const spyUpdate = jest.spyOn(CourseAPI.video.sessions, 'update');
    createdStore.dispatch(changePlayerState(playerStates.PLAYING));
    expect(createdStore.getState().video.sessionEvents.count()).toBe(1); // Sanity check to ensure events are generated
    createdStore.dispatch(sendEvents());

    expect(spyUpdate).toHaveBeenCalled();
    await sleep(1);
    expect(createdStore.getState().video.sessionEvents.count()).toBe(0);
  });
});

describe('endSession', () => {
  it('sends back events', async () => {
    const createdStore = createStore().store;
    const spyUpdate = jest.spyOn(CourseAPI.video.sessions, 'update');
    createdStore.dispatch(changePlayerState(playerStates.PLAYING));
    expect(createdStore.getState().video.sessionEvents.count()).toBe(1); // Sanity check to ensure events are generated
    createdStore.dispatch(sendEvents());

    expect(spyUpdate).toHaveBeenCalled();
    await sleep(1);
    expect(createdStore.getState().video.sessionEvents.count()).toBe(0);
  });

  describe('when there are no events', () => {
    it('still sends an update', async () => {
      const createdStore = createStore().store;
      const spyUpdate = jest.spyOn(CourseAPI.video.sessions, 'update');
      createdStore.dispatch(endSession());

      expect(spyUpdate).toHaveBeenCalledWith(32, 0, [], 0, false, true);
    });
  });
});
