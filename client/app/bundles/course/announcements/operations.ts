import CourseAPI from 'api/course';
import { Operation } from 'types/store';
import * as actions from './actions';

// eslint-disable-next-line import/prefer-default-export
export function deleteAnnouncement(accouncementId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.announcements.delete(accouncementId).then(() => {
      dispatch(actions.deleteAnnouncement(accouncementId));
    });
}
