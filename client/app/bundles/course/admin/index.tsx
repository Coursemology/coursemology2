import { render } from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/ProviderWrapper';
import { store } from './store';
import CourseSettings from './pages/CourseSettings';
import ComponentSettings from './pages/ComponentSettings';
import SidebarSettings from './pages/SidebarSettings';
import LessonPlanSettings from './pages/LessonPlanSettings';
import NotificationSettings from './pages/NotificationSettings';
import AssessmentSettings from './pages/AssessmentSettings';
import VideosSettings from './pages/VideosSettings';
import LeaderboardSettings from './pages/LeaderboardSettings';
import CommentsSettings from './pages/CommentsSettings';
import ForumsSettings from './pages/ForumsSettings';
import MaterialsSettings from './pages/MaterialsSettings';
import AnnouncementSettings from './pages/AnnouncementsSettings';
import SettingsNavigation from './components/SettingsNavigation';

const pages = [
  { path: 'components', element: <ComponentSettings /> },
  { path: 'sidebar', element: <SidebarSettings /> },
  { path: 'notifications', element: <NotificationSettings /> },
  { path: 'announcements', element: <AnnouncementSettings /> },
  { path: 'assessments', element: <AssessmentSettings /> },
  { path: 'materials', element: <MaterialsSettings /> },
  { path: 'forums', element: <ForumsSettings /> },
  { path: 'leaderboard', element: <LeaderboardSettings /> },
  { path: 'comments', element: <CommentsSettings /> },
  { path: 'videos', element: <VideosSettings /> },
  { path: 'lesson_plan', element: <LessonPlanSettings /> },
];

$(() => {
  const mountNode = document.getElementById('course-admin');
  if (!mountNode) return;

  render(
    <ProviderWrapper store={store}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/courses/:course_id/admin"
            element={<SettingsNavigation />}
          >
            <Route index element={<CourseSettings />} />

            {pages.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
    mountNode,
  );
});
