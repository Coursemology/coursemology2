import {
  AnyAction,
  combineReducers,
  configureStore,
  Reducer,
  ThunkAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';

import deleteConfirmationReducer from 'lib/reducers/deleteConfirmation';
import notificationPopupReducer from 'lib/reducers/notificationPopup';

import globalAnnouncementReducer from './bundles/announcements/store';
import sessionReducer from './bundles/common/store';
import achievementsReducer from './bundles/course/achievement/store';
import courseSettingsReducer from './bundles/course/admin/reducers';
import announcementsReducer from './bundles/course/announcements/store';
import scribingQuestionReducer from './bundles/course/assessment/question/scribing/store';
import skillsReducer from './bundles/course/assessment/skills/store';
import assessmentsReducer from './bundles/course/assessment/store';
import submissionsReducer from './bundles/course/assessment/submissions/store';
import unreadReducer from './bundles/course/container/unread';
import coursesReducer from './bundles/course/courses/store';
import commentsReducer from './bundles/course/discussion/topics/store';
import duplicationsReducer from './bundles/course/duplication/store';
import enrolRequestsReducer from './bundles/course/enrol-requests/store';
import disbursementReducer from './bundles/course/experience-points/disbursement/store';
import experiencePointsReducer from './bundles/course/experience-points/store';
import forumsReducer from './bundles/course/forum/store';
import groupsReducer from './bundles/course/group/store';
import leaderboardReducer from './bundles/course/leaderboard/store';
import learningMapReducer from './bundles/course/learning-map/store';
import lessonPlanReducer from './bundles/course/lesson-plan/store';
import levelsReducer from './bundles/course/level/store';
import foldersReducer from './bundles/course/material/folders/store';
import plagiarismReducer from './bundles/course/plagiarism/store';
import timelinesReducer from './bundles/course/reference-timelines/store';
import surveysReducer from './bundles/course/survey/store';
import userEmailSubscriptionsReducer from './bundles/course/user-email-subscriptions/store';
import invitationsReducer from './bundles/course/user-invitations/store';
import usersReducer from './bundles/course/users/store';
import videosReducer from './bundles/course/video/store';
import adminReducer from './bundles/system/admin/admin/store';
import instanceAdminReducer from './bundles/system/admin/instance/instance/store';
import globalUserReducer from './bundles/users/store';

enableMapSet();

const rootReducer = combineReducers({
  // The following reducers are of within a course.
  // Warning: navigating between courses MAY cause stale data
  // from the previous course if the store is not refreshed.
  // TODO: nest it into a course reducer
  achievements: achievementsReducer,
  announcements: announcementsReducer,
  assessments: assessmentsReducer,
  comments: commentsReducer,
  courses: coursesReducer,
  courseSettings: courseSettingsReducer,
  disbursement: disbursementReducer,
  duplication: duplicationsReducer,
  experiencePoints: experiencePointsReducer,
  enrolRequests: enrolRequestsReducer,
  folders: foldersReducer,
  forums: forumsReducer,
  groups: groupsReducer,
  invitations: invitationsReducer,
  leaderboard: leaderboardReducer,
  learningMap: learningMapReducer,
  lessonPlan: lessonPlanReducer,
  levels: levelsReducer,
  plagiarism: plagiarismReducer,
  scribingQuestion: scribingQuestionReducer,
  skills: skillsReducer,
  submissions: submissionsReducer,
  surveys: surveysReducer,
  timelines: timelinesReducer,
  users: usersReducer,
  userEmailSubscriptions: userEmailSubscriptionsReducer,
  videos: videosReducer,
  unread: unreadReducer,

  // The following reducers are of outside of a course.
  admin: adminReducer,
  instanceAdmin: instanceAdminReducer,
  global: combineReducers({
    user: globalUserReducer,
    announcements: globalAnnouncementReducer,
  }),
  session: sessionReducer,

  // The following reducers are for UI related rendering.
  // TODO: remove these (avoid using redux to render UI components)
  deleteConfirmation: deleteConfirmationReducer,
  notificationPopup: notificationPopupReducer,
});

const RESET_STORE_ACTION_TYPE = 'RESET_STORE_BOOM';

const purgeableRootReducer: Reducer<AppState> = (state, action) => {
  if (action.type === RESET_STORE_ACTION_TYPE) {
    // `session` is generally NOT ephemeral. If `session` is accidentally
    // purged without intuition, the router may flicker and break.
    state = { session: state?.session } as AppState;
  }

  return rootReducer(state, action);
};

export const store = configureStore({
  reducer: purgeableRootReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export type AppDispatch = ThunkDispatch<
  AppState,
  Record<string, unknown>,
  AnyAction
>;

export type Selector<T> = (state: AppState) => T;

export type Operation<R = void> = ThunkAction<
  Promise<R>,
  AppState,
  Record<string, unknown>,
  AnyAction
>;

export const dispatch = store.dispatch as AppDispatch;

/**
 * Resets the entire app's Redux store to `undefined`.
 */
export const resetStore = (): void => {
  dispatch({ type: RESET_STORE_ACTION_TYPE });
};

export const setUpStoreWithState = (
  preloadedState: Partial<AppState>,
): typeof store => configureStore({ reducer: rootReducer, preloadedState });
