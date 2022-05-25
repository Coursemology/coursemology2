import { toast } from 'react-toastify';
import CourseAPI from 'api/course';
import { setReactHookFormError } from 'lib/helpers/actions-helper';
import { getCourseId } from 'lib/helpers/url-helpers';
import { AchievementFormData } from 'types/course/achievements';
import { Operation } from 'types/store';
import * as actions from './actions';
import { SaveAchievementAction } from './types';

/**
 * Prepares and maps object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { achievement :
 *     { title, description, badge: file }
 *   }
 */
const formatAttributes = (data: AchievementFormData): FormData => {
  const payload = new FormData();

  ['title', 'description', 'published'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`achievement[${field}]`, data[field]);
    }
  });
  if (data.badge.file) {
    payload.append('achievement[badge]', data.badge.file);
  }

  return payload;
};

export function fetchAchievements(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.achievements
      .index()
      .then((response) => {
        const data = response.data;

        dispatch(
          actions.saveAchievementList(data.achievements, data.permissions),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function loadAchievement(
  achievementId: number,
): Operation<SaveAchievementAction> {
  return async (dispatch) =>
    CourseAPI.achievements
      .fetch(achievementId)
      .then((response) =>
        dispatch(actions.saveAchievement(response.data.achievement)),
      );
}

export function loadAchievementCourseUsers(
  achievementId: number,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.achievements
      .fetchAchievementCourseUsers(achievementId)
      .then((response) => {
        dispatch(
          actions.saveAchievementCourseUsers(
            achievementId,
            response.data.achievementCourseUsers,
          ),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function createAchievement(
  data: AchievementFormData,
  successMessage: string,
  failureMessage: string,
  setError: Function,
  navigate: Function,
): Operation<void> {
  const attributes = formatAttributes(data);

  return async (dispatch) =>
    CourseAPI.achievements
      .create(attributes)
      .then((response) => {
        toast.success(successMessage);
        setTimeout(() => {
          if (response.data && response.data.id) {
            navigate(
              `/courses/${getCourseId()}/achievements/${response.data.id}`,
            );
          }
        }, 200);
      })
      .catch((error) => {
        toast.error(failureMessage);
        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        throw error;
      });
}

export function updateAchievement(
  achievementId: number,
  data: AchievementFormData,
  successMessage: string,
  failureMessage: string,
  setError: Function,
  navigate: Function,
): Operation<void> {
  const attributes = formatAttributes(data);
  return async (dispatch) =>
    CourseAPI.achievements
      .update(achievementId, attributes)
      .then(() => {
        toast.success(successMessage);
        setTimeout(() => {
          navigate(`/courses/${getCourseId()}/achievements`);
        }, 500);
      })
      .catch((error) => {
        toast.error(failureMessage);
        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        throw error;
      });
}

export function deleteAchievement(
  achievementId: number,
  successMessage: string,
  failureMessage: string,
  navigateToIndex: boolean,
  navigate: Function,
): Operation<void> {
  return async (dispatch) =>
    CourseAPI.achievements
      .delete(achievementId)
      .then(() => {
        dispatch(actions.deleteAchievement(achievementId));
        toast.success(successMessage);
        if (navigateToIndex) {
          navigate(`/courses/${getCourseId()}/achievements/`);
        }
      })
      .catch((error) => {
        toast.error(failureMessage);
        throw error;
      });
}

export function awardAchievement(
  achievementId: number,
  data: number[],
  successMessage: string,
  failureMessage: string,
  navigate: Function,
): Operation<void> {
  const attributes = { achievement: { course_user_ids: data } };
  return async (dispatch) =>
    CourseAPI.achievements
      .update(achievementId, attributes)
      .then((response) => {
        toast.success(successMessage);
        setTimeout(() => {
          navigate(`/courses/${getCourseId()}/achievements/${achievementId}`);
          dispatch(actions.saveAchievement(response.data.achievement));
        }, 100);
      })
      .catch((error) => {
        toast.error(failureMessage);
        throw error;
      });
}

export function updatePublishedAchievement(
  achievementId: number,
  data: boolean,
  successMessage: string,
  failureMessage: string,
): Operation<void> {
  const attributes = { achievement: { published: data } };
  return async (dispatch) =>
    CourseAPI.achievements
      .update(achievementId, attributes)
      .then((response) => {
        toast.success(successMessage);
        setTimeout(() => {
          dispatch(actions.saveAchievement(response.data.achievement));
        }, 100);
      })
      .catch((error) => {
        toast.error(failureMessage);
        throw error;
      });
}
