import NotificationsAPI from './Notifications';
import LessonPlanAPI from './LessonPlan';

const AdminAPI = {
  notifications: new NotificationsAPI(),
  lessonPlan: new LessonPlanAPI(),
};

Object.freeze(AdminAPI);

export default AdminAPI;
