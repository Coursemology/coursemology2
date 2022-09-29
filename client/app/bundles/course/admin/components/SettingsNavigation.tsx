import { createContext, useContext, useEffect, useState } from 'react';
import { Chip } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import CourseAPI from 'api/course';
import { CourseAdminOptions } from 'types/course/admin/course';
import LoadingIndicator from 'lib/components/LoadingIndicator';

const fetchOptions = async (): Promise<CourseAdminOptions> => {
  const response = await CourseAPI.admin.course.options();
  return response.data;
};

const OptionsReloaderContext = createContext(() => {});

export const useOptionsReloader = (): (() => void) =>
  useContext(OptionsReloaderContext);

const SettingsNavigation = (): JSX.Element => {
  const [options, setOptions] = useState<CourseAdminOptions>();

  useEffect(() => {
    fetchOptions().then(setOptions);
  }, []);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const reloadOptions = (): void => {
    fetchOptions().then(setOptions);
  };

  if (!options) return <LoadingIndicator />;

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

        <Outlet />
      </div>
    </OptionsReloaderContext.Provider>
  );
};

export default SettingsNavigation;
