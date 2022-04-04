import NotificationsAPI from './Notifications';
import LessonPlanAPI from './LessonPlan';
import PersonalizedTimelineAPI from './PersonalizedTimeline';

const AdminAPI = {
  notifications: new NotificationsAPI(),
  lessonPlan: new LessonPlanAPI(),
  personalizedTimeline: new PersonalizedTimelineAPI(),
};

Object.freeze(AdminAPI);

export default AdminAPI;
