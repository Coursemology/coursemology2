import { createContext, Suspense, useContext, useState } from 'react';
import { Chip } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import CourseAPI from 'api/course';
import { CourseAdminOptions } from 'types/course/admin/course';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import useSuspendedFetch from 'lib/hooks/useSuspendedFetch';

const fetchOptions = async (): Promise<CourseAdminOptions> => {
  const response = await CourseAPI.admin.course.options();
  return response.data;
};

const OptionsReloaderContext = createContext(() => {});

export const useOptionsReloader = (): (() => void) =>
  useContext(OptionsReloaderContext);

const SettingsNavigationLayout = (): JSX.Element => {
  const { data: settings } = useSuspendedFetch(fetchOptions);
  const [options, setOptions] = useState(settings);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const reloadOptions = (): void => {
    fetchOptions().then(setOptions);
  };

  return (
    <OptionsReloaderContext.Provider value={reloadOptions}>
      <div className="flex flex-col">
        <div className="-m-2 pb-10">
          {options.map(({ title, path }) => (
            <Chip
              key={path}
              label={title}
              onClick={(): void => navigate(path)}
              className={`m-2 ${path === pathname && 'p-[1px]'}`}
              clickable={path !== pathname}
              variant={path === pathname ? 'filled' : 'outlined'}
            />
          ))}
        </div>

        <Suspense fallback={<LoadingIndicator />}>
          <Outlet />
        </Suspense>
      </div>
    </OptionsReloaderContext.Provider>
  );
};

const SettingsNavigation = (): JSX.Element => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <SettingsNavigationLayout />
    </Suspense>
  );
};

export default SettingsNavigation;
