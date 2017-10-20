import { playerStates, videoActionTypes, videoDefaults } from 'lib/constants/videoConstants';
import { isPlayingState, timeIsPastRestricted } from 'lib/helpers/videoHelpers';

export const initialState = {
  videoId: null,
  videoUrl: null,
  playerState: playerStates.UNSTARTED,
  playerProgress: 0,
  duration: videoDefaults.placeHolderDuration,
  bufferProgress: 0,
  playerVolume: videoDefaults.volume,
  playbackRate: 1,
  restrictContentAfter: null,
  forceSeek: false,
};

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
  if (timeIsPastRestricted(state.restrictContentAfter, stateChange.playerProgress)) {
    stateChange.playerProgress = state.restrictContentAfter;
    stateChange.forceSeek = true;
    stateChange.playerState = playerStates.PAUSED;
  }

  stateChange.playerProgress = Math.max(0, Math.min(state.duration, stateChange.playerProgress));
  // No point seeking if the progress is not changed
  stateChange.forceSeek = stateChange.forceSeek && stateChange.playerProgress !== state.playerProgress;
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
  if (timeIsPastRestricted(state.restrictContentAfter, state.playerProgress) && isPlayingState(newPlayerState)) {
    return isPlayingState(state.playerState) ? playerStates.PAUSED : state.playerState;
  }

  if (newPlayerState === playerStates.BUFFERING && !isPlayingState(state.playerState)) {
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
  return changes => Object.assign({}, state, { forceSeek: false }, changes);
}

export default function (state = initialState, action) {
  // Only forceSeek if explicitly specified
  const transformState = generateStateTransformer(state);

  switch (action.type) {
    case videoActionTypes.CHANGE_PLAYER_STATE:
      return transformState({ playerState: computePlayerState(state, action.playerState) });
    case videoActionTypes.CHANGE_PLAYER_VOLUME:
      return transformState({ playerVolume: action.playerVolume });
    case videoActionTypes.CHANGE_PLAYBACK_RATE:
      return transformState({ playbackRate: action.playbackRate });
    case videoActionTypes.UPDATE_PLAYER_PROGRESS:
      return transformState(computeTimeAdjustChange(state, action.playerProgress, action.forceSeek));
    case videoActionTypes.UPDATE_BUFFER_PROGRESS:
      return transformState({ bufferProgress: Math.max(0, Math.min(state.duration, action.bufferProgress)) });
    case videoActionTypes.UPDATE_PLAYER_DURATION:
      return transformState({ duration: action.duration });
    case videoActionTypes.UPDATE_RESTRICTED_TIME:
      return transformState({ restrictContentAfter: action.restrictContentAfter });
    default:
      return state;
  }
}
