import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CourseLayoutData } from 'types/course/courses';

import CourseAPI from 'api/course';

interface CikgoSidebarItemsProps {
  sidebarData: CourseLayoutData;
}

/**
 * This component independently fetches the unread counts for "Learn" and
 * "Mission Control" sidebar items. It exists because Cikgo's servers may not always
 * respond in time, and blocking `/sidebar` requests while waiting for Cikgo's
 * servers' response will slow Coursemology's page loads down.
 *
 * The promises in this component will fail silently to prevent any side effects
 * when rendering its parent component, e.g., `CourseContainer`. Failed requests
 * can be inspected under _Network_ in the browser's developer tools.
 */
const CikgoSidebarItems = ({ sidebarData }: CikgoSidebarItemsProps): null => {
  const { courseId } = useParams();

  const shouldLoadLearn = useMemo(
    () => sidebarData.sidebar?.some((item) => item.key === 'learn'),
    [sidebarData.sidebar],
  );

  const shouldLoadMissionControl = useMemo(
    () =>
      sidebarData.adminSidebar?.some((item) => item.key === 'mission_control'),
    [sidebarData.adminSidebar],
  );

  useEffect(() => {
    if (!shouldLoadLearn) return;

    CourseAPI.stories.learn().catch(() => {});
  }, [courseId, shouldLoadLearn]);

  useEffect(() => {
    if (!shouldLoadMissionControl) return;

    CourseAPI.stories.missionControl().catch(() => {});
  }, [courseId, shouldLoadMissionControl]);

  return null;
};

export default CikgoSidebarItems;
