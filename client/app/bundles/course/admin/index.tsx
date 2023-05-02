import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import SettingsNavigation from './components/SettingsNavigation';
import AnnouncementSettings from './pages/AnnouncementsSettings';
import AssessmentSettings from './pages/AssessmentSettings';
import CodaveriSettings from './pages/CodaveriSettings';
import CommentsSettings from './pages/CommentsSettings';
import ComponentSettings from './pages/ComponentSettings';
import CourseSettings from './pages/CourseSettings';
import ForumsSettings from './pages/ForumsSettings';
import LeaderboardSettings from './pages/LeaderboardSettings';
import LessonPlanSettings from './pages/LessonPlanSettings';
import MaterialsSettings from './pages/MaterialsSettings';
import NotificationSettings from './pages/NotificationSettings';
import SidebarSettings from './pages/SidebarSettings';
import VideosSettings from './pages/VideosSettings';
import { store } from './store';

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
  { path: 'codaveri', element: <CodaveriSettings /> },
];

$(() => {
  const mountNode = document.getElementById('app-root');
  if (!mountNode) return;

  const root = createRoot(mountNode);

  root.render(
    <ProviderWrapper store={store}>
      <BrowserRouter>
        <Routes>
          <Route
            element={<SettingsNavigation />}
            path="/courses/:course_id/admin"
          >
            <Route element={<CourseSettings />} index />

            {pages.map(({ path, element }) => (
              <Route key={path} element={element} path={path} />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
