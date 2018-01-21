import mirrorCreator from 'mirror-creator';

export const youtubeOpts = {
  playerVars: {
    showinfo: false,
    rel: false,
    iv_load_policy: 3,
    controls: 0,
    disablekb: true,
  },
};

export const videoDefaults = {
  volume: 0.8,
  availablePlaybackRates: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5],
  placeHolderDuration: 600,
  progressUpdateFrequencyMs: 500,
};

export const playerStates = mirrorCreator([
  'UNSTARTED',
  'ENDED',
  'PLAYING',
  'PAUSED',
  'BUFFERING',
]);

export const postRequestingStatuses = mirrorCreator([
  'LOADING',
  'LOADED',
  'ERROR',
]);

export const videoActionTypes = mirrorCreator([
  'CHANGE_PLAYER_STATE',
  'CHANGE_PLAYER_VOLUME',
  'CHANGE_PLAYBACK_RATE',
  'UPDATE_PLAYER_PROGRESS',
  'UPDATE_BUFFER_PROGRESS',
  'UPDATE_PLAYER_DURATION',
  'UPDATE_RESTRICTED_TIME',
  'SEEK_START',
  'SEEK_END',
]);

export const discussionActionTypes = mirrorCreator([
  'UPDATE_NEW_POST',
  'ADD_TOPIC',
  'UPDATE_TOPIC',
  'REMOVE_TOPIC',
  'ADD_POST',
  'UPDATE_POST',
  'REMOVE_POST',
  'ADD_REPLY',
  'UPDATE_REPLY',
  'REMOVE_REPLY',
  'CHANGE_AUTO_SCROLL',
  'UNSET_SCROLL_TOPIC',
  'REFRESH_ALL',
]);

export const sessionActionTypes = mirrorCreator([
  'REMOVE_EVENTS',
]);

export const notificationActionTypes = mirrorCreator([
  'SET_NOTIFICATION',
]);
