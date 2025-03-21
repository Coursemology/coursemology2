import { ComponentRef, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MenuOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { CourseLayoutData } from 'types/course/courses';

import CikgoSidebarItems from 'course/stories/components/CikgoSidebarItems';
import PopupNotifier from 'course/user-notification/PopupNotifier';
import Footer from 'lib/components/core/layouts/Footer';
import {
  DataHandle,
  DEFAULT_WINDOW_TITLE,
  getLastCrumbTitle,
  useDynamicNest,
} from 'lib/hooks/router/dynamicNest';
import useTranslation, { translatable } from 'lib/hooks/useTranslation';

import Breadcrumbs from './Breadcrumbs';
import { loader, useCourseLoader } from './CourseLoader';
import Sidebar from './Sidebar';

const CourseContainer = (): JSX.Element => {
  const location = useLocation();

  const data = useCourseLoader();

  const { t } = useTranslation();

  const sidebarRef = useRef<ComponentRef<typeof Sidebar>>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ behavior: 'smooth', top: 0 });
  }, [location.pathname]);

  const { crumbs, loading, activePath } = useDynamicNest();

  const crumbTitle = getLastCrumbTitle(crumbs);
  const title = translatable(crumbTitle) ? t(crumbTitle) : crumbTitle;

  useEffect(() => {
    document.title = title ?? DEFAULT_WINDOW_TITLE;
  }, [title]);

  return (
    <main className="flex h-full min-h-0 w-full">
      <Sidebar
        ref={sidebarRef}
        activePath={activePath}
        from={data}
        onChangeVisibility={setSidebarOpen}
      />

      <div ref={ref} className="flex min-h-full w-full flex-col overflow-auto">
        <div className="flex h-[4rem] w-full items-center">
          {!sidebarOpen && (
            <IconButton onClick={(): void => sidebarRef.current?.show()}>
              <MenuOutlined />
            </IconButton>
          )}

          <Breadcrumbs
            className="h-[4rem] w-full overflow-hidden"
            in={crumbs}
            loading={loading}
          />
        </div>

        <div className="flex-grow">
          <Outlet context={data} />
        </div>

        <Footer />
      </div>

      <PopupNotifier />

      <CikgoSidebarItems sidebarData={data} />
    </main>
  );
};

const handle: DataHandle = (match) => {
  return (match.data as CourseLayoutData).courseTitle;
};

export default Object.assign(CourseContainer, { loader, handle });
