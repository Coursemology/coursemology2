import { List as makeImmutableList } from 'immutable';
import {
  playerStates,
  captionsStates,
  sessionActionTypes,
  videoActionTypes,
  videoDefaults,
} from 'lib/constants/videoConstants';
import { isPlayingState, timeIsPastRestricted } from 'lib/helpers/videoHelpers';
import { createTransform } from 'redux-persist';

export const initialState = {
  videoUrl: null,
  watchNextVideoUrl: null,
  nextVideoSubmissionExists: false,
  playerState: playerStates.UNSTARTED,
  playerProgress: 0,
  duration: videoDefaults.placeHolderDuration,
  bufferProgress: 0,
  playerVolume: videoDefaults.volume,
  playbackRate: 1,
  captionsState: captionsStates.NOT_LOADED,
  restrictContentAfter: null,
  forceSeek: false,
  initialSeekTime: null,
  sessionId: null,
  sessionSequenceNum: 0,
  sessionEvents: makeImmutableList(),
  sessionClosed: false,
};

export const persistTransform = createTransform(
  (inboundState) => ({
    ...inboundState,
    sessionEvents: inboundState.sessionEvents.toJS(),
  }),
  (outboundState) => ({
    ...outboundState,
    sessionEvents: makeImmutableList(outboundState.sessionEvents),
  }),
  { whitelist: ['video'] },
);

/**
 * Calculates the state changes required for a playerProgress update.
 *
 * If the new suggested time exceeds the restrictContentAfter time, it is adjusted back to restrictContentAfter.
 * Additionally, forceSeek will be set and playerState will be set to PAUSED so that the video freezes at
 * restrictContentAfter.
 * @param state The Redux video state
 * @param suggestedTime The time provided by the action to adjust time to
 * @param forceSeek If the forceSeek flag is requested to be set by an action
 * @returns {Object} An object with states to merge into Redux
 */
function computeTimeAdjustChange(state, suggestedTime, forceSeek = false) {
  const stateChange = {
    playerProgress: suggestedTime,
    forceSeek,
    playerState: state.playerState,
  };
  if (
    timeIsPastRestricted(state.restrictContentAfter, stateChange.playerProgress)
  ) {
    stateChange.playerProgress = state.restrictContentAfter;
    stateChange.forceSeek = true;
    stateChange.playerState = playerStates.PAUSED;
  }

  stateChange.playerProgress = Math.max(
    0,
    Math.min(state.duration, stateChange.playerProgress),
  );
  // No point seeking if the progress is not changed
  stateChange.forceSeek =
    stateChange.forceSeek &&
    stateChange.playerProgress !== state.playerProgress;
  return stateChange;
}

/**
 * Computes the new player state based on the new state an action provides and the current player progress.
 *
 * If the player is past the restricted time, then the playerState will be forced into a non-playing state (either the
 * old state or playerStates.PAUSED).
 *
 * If the new playing state BUFFERING but the player was not even playing to begin with, the old player state is
 * returned instead.
 *
 * If neither are true, the newPlayerState returned.
 * @param state The entire video Redux state
 * @param newPlayerState The new playerState to be set
 * @returns {playerStates} The new playerState to set into Redux
 */
function computePlayerState(state, newPlayerState) {
  if (
    timeIsPastRestricted(state.restrictContentAfter, state.playerProgress) &&
    isPlayingState(newPlayerState)
  ) {
    return isPlayingState(state.playerState)
      ? playerStates.PAUSED
      : state.playerState;
  }

  if (
    newPlayerState === playerStates.BUFFERING &&
    !isPlayingState(state.playerState)
  ) {
    return state.playerState;
  }

  return newPlayerState;
}

/**
 * Generates a state transformer function that merges changes into state and produces a new state object.
 *
 * The generated transformer is a pure function and does not modify original state.
 *
 * The forceSeek flag is always set to false by the transformer unless explicitly turned on within changes.
 * @param state The original state object
 * @returns {function(Object): Object} A function that produces the next state object when changes are provided
 */
function generateStateTransformer(state) {
  return (changes) => ({ ...state, forceSeek: false, ...changes });
}

/**
 * The reducer to transform the video state excluding session data.
 *
 * This reducer changes the video's UI states, such as playback rate, volume, and player progress.
 * @param state The original state object.
 * @param action The action the reducer is to process
 * @return {*} The transformed state.
 */
function videoStateReducer(state = initialState, action) {
  // Only forceSeek if explicitly specified
  const transformState = generateStateTransformer(state);

  switch (action.type) {
    case videoActionTypes.CHANGE_PLAYER_STATE:
      return transformState({
        playerState: computePlayerState(state, action.playerState),
      });
    case videoActionTypes.CHANGE_PLAYER_VOLUME:
      return transformState({ playerVolume: action.playerVolume });
    case videoActionTypes.CHANGE_CAPTIONS_STATE:
      return transformState({ captionsState: action.captionsState });
    case videoActionTypes.CHANGE_PLAYBACK_RATE:
      return transformState({ playbackRate: action.playbackRate });
    case videoActionTypes.UPDATE_PLAYER_PROGRESS:
      return transformState(
        computeTimeAdjustChange(state, action.playerProgress, action.forceSeek),
      );
    case videoActionTypes.UPDATE_BUFFER_PROGRESS:
      return transformState({
        bufferProgress: Math.max(
          0,
          Math.min(state.duration, action.bufferProgress),
        ),
      });
    case videoActionTypes.UPDATE_PLAYER_DURATION:
      return transformState({ duration: action.duration });
    case videoActionTypes.UPDATE_RESTRICTED_TIME:
      return transformState({
        restrictContentAfter: action.restrictContentAfter,
      });
    default:
      return state;
  }
}

/**
 * Generates a session event based on the event type.
 *
 * This function produces a base event, recording the player progress and playback rate, as well as assign a sequence
 * number based on the value stored in the state. These parameters can be extended or overwritten with the params
 * argument.
 * @param state The original state object.
 * @param type The event type.
 * @param params The parameters to overwrite or extend the base evnt with.
 * @return {*} The event object to record.
 */
function generateEvent(state, type, params = {}) {
  return {
    sequence_num: state.sessionSequenceNum,
    event_type: type,
    video_time: Math.round(state.playerProgress),
    playback_rate: state.playbackRate,
    event_time: new Date(),
    ...params,
  };
}

/**
 * Handles the session state change for a player state change.
 *
 * This function produces a new state with a new session event included on a player state change. If the player state
 * will not change, or if the new player state does not need recording, the original state is returned.
 * @param state The original state object.
 * @param action The action to process.
 * @return {*} The transformed state object.
 */
function handleSessionChangeState(state, action) {
  let stateChange = null;
  if (state.playerState === action.playerState) {
    return state;
  }
  if (action.playerState === playerStates.PLAYING) {
    stateChange = 'play';
  } else if (action.playerState === playerStates.PAUSED) {
    stateChange = 'pause';
  } else if (
    action.playerState === playerStates.BUFFERING &&
    isPlayingState(state.playerState)
  ) {
    stateChange = 'buffer';
  } else if (action.playerState === playerStates.ENDED) {
    stateChange = 'end';
  } else {
    return state;
  }

  return {
    ...state,
    sessionSequenceNum: state.sessionSequenceNum + 1,
    sessionEvents: state.sessionEvents.push(generateEvent(state, stateChange)),
  };
}

/**
 * The reducer to transform the session data.
 *
 * This reducer listens to actions that we want to record and creates a new event in state.sessionEvents. The exception
 * is the REMOVE_EVENTS action, where specified events will be removed.
 * @param state The original state object.
 * @param action The action the reducer is to process
 * @return {*} The transformed state.
 */
function videoSessionReducer(state = initialState, action) {
  if (!state.sessionId) {
    return state;
  }
  const events = state.sessionEvents;
  switch (action.type) {
    case videoActionTypes.CHANGE_PLAYBACK_RATE:
      return {
        ...state,
        sessionSequenceNum: state.sessionSequenceNum + 1,
        sessionEvents: events.push(
          generateEvent(state, 'speed_change', {
            playback_rate: action.playbackRate,
          }),
        ),
      };
    case videoActionTypes.CHANGE_PLAYER_STATE:
      return handleSessionChangeState(state, action);
    case videoActionTypes.SEEK_START:
      return {
        ...state,
        sessionSequenceNum: state.sessionSequenceNum + 1,
        sessionEvents: events.push(generateEvent(state, 'seek_start')),
      };
    case videoActionTypes.SEEK_END:
      return {
        ...state,
        sessionSequenceNum: state.sessionSequenceNum + 1,
        sessionEvents: events.push(generateEvent(state, 'seek_end')),
      };
    case sessionActionTypes.REMOVE_EVENTS:
      return {
        ...state,
        sessionEvents: events.filterNot((event) =>
          action.sequenceNums.has(event.sequence_num),
        ),
        sessionClosed: action.sessionClosed,
      };
    default:
      return state;
  }
}

export default function (state = initialState, action) {
  return videoStateReducer(videoSessionReducer(state, action), action);
}
