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
  availablePlaybackRates: [0.5, 1, 1.5, 2, 2.5],
  placeHolderDuration: 600,
  progressUpdateFrequencyMs: 500,
};

export const videoActionTypes = mirrorCreator([
  'CHANGE_PLAYER_STATE',
  'CHANGE_PLAYER_VOLUME',
  'CHANGE_PLAYBACK_RATE',
  'UPDATE_PLAYER_PROGRESS',
  'UPDATE_BUFFER_PROGRESS',
  'UPDATE_PLAYER_DURATION',
  'UPDATE_RESTRICTED_TIME',
]);

export const playerStates = mirrorCreator([
  'UNSTARTED',
  'ENDED',
  'PLAYING',
  'PAUSED',
  'BUFFERING',
]);
