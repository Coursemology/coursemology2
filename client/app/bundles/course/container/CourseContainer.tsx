import { Outlet } from 'react-router-dom';
import { CourseLayoutData } from 'types/course/courses';

import CikgoSidebarItems from 'course/stories/components/CikgoSidebarItems';
import PopupNotifier from 'course/user-notification/PopupNotifier';
import SidebarLayout from 'lib/components/core/layouts/SidebarLayout';
import Breadcrumbs from 'lib/components/navigation/Breadcrumbs';
import {
  DataHandle,
  useDynamicNest,
  usePageTitle,
} from 'lib/hooks/router/dynamicNest';

import { loader, useCourseLoader } from './CourseLoader';
import Sidebar from './Sidebar';

const CourseContainer = (): JSX.Element => {
  const data = useCourseLoader();

  const { crumbs, loading, activePath } = useDynamicNest();
  usePageTitle(crumbs);

  return (
    <>
      <SidebarLayout
        sidebar={<Sidebar activePath={activePath} from={data} />}
        topBar={(showSidebarButton) => (
          <div className="flex h-[4.5rem] w-full items-center">
            {showSidebarButton}

            <Breadcrumbs
              className="h-[4.5rem] w-full overflow-hidden"
              in={crumbs}
              loading={loading}
            />
          </div>
        )}
      >
        <Outlet context={data} />
      </SidebarLayout>

      <PopupNotifier />

      <CikgoSidebarItems sidebarData={data} />
    </>
  );
};

const handle: DataHandle = (match) => {
  return (match.data as CourseLayoutData).courseTitle;
};

export default Object.assign(CourseContainer, { loader, handle });
