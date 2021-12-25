import LessonPlanAPI from './LessonPlan';
import NotificationsAPI from './Notifications';

const AdminAPI = {
  notifications: new NotificationsAPI(),
  lessonPlan: new LessonPlanAPI(),
};

Object.freeze(AdminAPI);

export default AdminAPI;
