import { ComponentRef, useEffect, useRef, useState } from 'react';
import {
  LoaderFunction,
  Outlet,
  useLoaderData,
  useLocation,
} from 'react-router-dom';
import { MenuOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { CourseLayoutData } from 'types/course/courses';

import CourseAPI from 'api/course';
import PopupNotifier from 'course/user-notification/PopupNotifier';
import Footer from 'lib/components/core/layouts/Footer';
import { DataHandle, useDynamicNest } from 'lib/hooks/router/dynamicNest';

import Breadcrumbs from './Breadcrumbs';
import Sidebar from './Sidebar';

const CourseContainer = (): JSX.Element => {
  const location = useLocation();

  const data = useLoaderData() as CourseLayoutData;

  const sidebarRef = useRef<ComponentRef<typeof Sidebar>>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ behavior: 'smooth', top: 0 });
  }, [location.pathname]);

  const { crumbs, loading, activePath } = useDynamicNest();

  return (
    <main className="flex h-full min-h-0 w-full">
      <Sidebar
        ref={sidebarRef}
        activePath={activePath}
        from={data}
        onChangeVisibility={setSidebarOpen}
      />

      <div ref={ref} className="h-full w-full overflow-scroll">
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

        <div className="min-h-[calc(100%_-_4rem)] w-full">
          <Outlet />
        </div>

        <Footer />
      </div>

      <PopupNotifier />
    </main>
  );
};

const loader: LoaderFunction = async ({ params }) => {
  const id = parseInt(params?.courseId ?? '', 10) || undefined;
  if (!id) throw new Error(`CourseContainer was loaded with ID: ${id}.`);

  const response = await CourseAPI.courses.fetchLayout(id);
  return response.data;
};

const handle: DataHandle = (match) => {
  return (match.data as CourseLayoutData).courseTitle;
};

export default Object.assign(CourseContainer, { loader, handle });
