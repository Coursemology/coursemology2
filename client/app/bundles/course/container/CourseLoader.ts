import {
  LoaderFunction,
  useLoaderData,
  useOutletContext,
} from 'react-router-dom';
import { CourseLayoutData, SidebarItemData } from 'types/course/courses';

import CourseAPI from 'api/course';
import { syncSignals } from 'lib/hooks/unread';

const extractUnreadCountsInto = (
  record: Record<string, number>,
  data: SidebarItemData[],
): Record<string, number> =>
  data.reduce<Record<string, number>>((unreads, item) => {
    if (item.unread) unreads[item.key] = item.unread;
    return unreads;
  }, record);

const extractUnreadCountsFromLayoutData = (
  data: CourseLayoutData,
): Record<string, number> => {
  const unreads: Record<string, number> = {};

  if (data.sidebar) extractUnreadCountsInto(unreads, data.sidebar);
  if (data.adminSidebar) extractUnreadCountsInto(unreads, data.adminSidebar);

  return unreads;
};

export const loader: LoaderFunction = async ({ params }) => {
  const id = parseInt(params?.courseId ?? '', 10) || undefined;
  if (!id) throw new Error(`CourseContainer was loaded with ID: ${id}.`);

  const response = await CourseAPI.courses.fetchLayout(id);

  syncSignals(extractUnreadCountsFromLayoutData(response.data));

  return response.data;
};

export const useCourseLoader = (): CourseLayoutData =>
  useLoaderData() as CourseLayoutData;

export const useCourseContext = (): CourseLayoutData => useOutletContext();
