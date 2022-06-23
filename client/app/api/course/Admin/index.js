import NotificationsAPI from './Notifications';
import LessonPlanAPI from './LessonPlan';
import BaseAdminAPI from './Base';

const AdminAPI = {
  system: new BaseAdminAPI(),
  notifications: new NotificationsAPI(),
  lessonPlan: new LessonPlanAPI(),
};

Object.freeze(AdminAPI);

export default AdminAPI;
