import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { GlobalAnnouncementState } from 'bundles/announcements/types';
import { AchievementsState } from 'bundles/course/achievement/types';
import { AnnouncementsState } from 'bundles/course/announcements/types';
import { MonitoringState } from 'bundles/course/assessment/pages/AssessmentMonitoring/types';
import { SkillState } from 'bundles/course/assessment/skills/types';
import { SubmissionsState } from 'bundles/course/assessment/submissions/types';
import { CoursesState } from 'bundles/course/courses/types';
import { CommentState } from 'bundles/course/discussion/topics/types';
import { EnrolRequestsState } from 'bundles/course/enrol-requests/types';
import { DisbursementState } from 'bundles/course/experience-points/disbursement/types';
import { ForumsState } from 'bundles/course/forum/types';
import { LeaderboardState } from 'bundles/course/leaderboard/types';
import { FoldersState } from 'bundles/course/material/folders/types';
import { TimelinesState } from 'bundles/course/reference-timelines/types';
import { InvitationsState } from 'bundles/course/user-invitations/types';
import { UsersState } from 'bundles/course/users/types';
import { VideosState } from 'bundles/course/video/types';
import { AdminState } from 'bundles/system/admin/admin/types';
import { InstanceAdminState } from 'bundles/system/admin/instance/instance/types';
import { GlobalUserState } from 'bundles/users/types';

/**
 * Describes the overall shape of the application's Redux store state.
 * @deprecated Use `RootState` instead.
 */
export interface AppState {
  admin: AdminState;
  instanceAdmin: InstanceAdminState;
  achievements: AchievementsState;
  announcements: AnnouncementsState;
  courses: CoursesState;
  folders: FoldersState;
  forums: ForumsState;
  users: UsersState;
  leaderboard: LeaderboardState;
  skills: SkillState;
  submissions: SubmissionsState;
  invitations: InvitationsState;
  enrolRequests: EnrolRequestsState;
  disbursement: DisbursementState;
  comments: CommentState;
  videos: VideosState;
  global: { user: GlobalUserState; announcements: GlobalAnnouncementState };
  timelines: TimelinesState;
  monitoring: MonitoringState;
}

export type Operation<R = void> = ThunkAction<
  Promise<R>,
  AppState,
  Record<string, unknown>,
  AnyAction
>;

/**
 * @deprecated Use `store/AppDispatch` instead.
 */
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
