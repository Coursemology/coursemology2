import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { AchievementsState } from 'bundles/course/achievement/types';
import { CoursesState } from 'bundles/course/courses/types';
import { UsersState } from 'bundles/course/users/types';
import { LeaderboardState } from 'bundles/course/leaderboard/types';

/**
 * Describes the overall shape of the application's Redux store state.
 */
export interface AppState {
  achievements: AchievementsState;
  courses: CoursesState;
  users: UsersState;
  leaderboard: LeaderboardState;
}

export type Operation<R> = ThunkAction<
  Promise<R>,
  AppState,
  Record<string, unknown>,
  AnyAction
>;

export type AppDispatch = ThunkDispatch<
  AppState,
  Record<string, unknown>,
  AnyAction
>;

interface EntityMetadata {
  // The timestamp at which the entity was last updated, in number of milliseconds since UTC.
  lastUpdate: number;
  // The timestamp at which the full entity was last updated, in number of milliseconds since UTC.
  lastFullUpdate: number;
}

/**
 * The type of the identifier accepted by selectors.
 */
export type SelectionKey = number | null | undefined;

/**
 * The type of the return value of selectors that selects an entity from an
 * `EntityStore` using its ID.
 */
export type EntitySelection<T> = (T & EntityMetadata) | null;

/**
 * An EntityStore is a subset of the Redux store that stores a specific type of record
 * or data, which are identified by their IDs.
 *
 * The EntityStore is designed to store data received from the API server, after they
 * have been normalized into their respective Entities (hence the name 'EntityStore').
 *
 * Entities in the store may be incomplete (i.e. non-detailed or 'mini') or complete
 * (i.e. detailed or 'full'). The parameter `M` denotes the type of incomplete
 * entities, whereas `E` denotes the type of complete entities. If such a distinction
 * between incomplete and complete entities is not necessary, the second parameter can
 * be left out.
 *
 * Note that all interactions with the EntityStore should be performed via helper
 * functions found in `utils/store.ts`.
 */
export interface EntityStore<M, E extends M = M> {
  ids: Set<SelectionKey>;
  byId: { [key: number]: (M & Partial<E> & EntityMetadata) | undefined };
}
