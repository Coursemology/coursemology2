import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Chip } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import CourseAPI from 'api/course';
import { CourseAdminItems } from 'types/course/admin/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

const fetchItems = async (): Promise<CourseAdminItems> => {
  const response = await CourseAPI.admin.course.items();
  return response.data;
};

const ItemsReloaderContext = createContext(() => {});

export const useItemsReloader = (): (() => void) =>
  useContext(ItemsReloaderContext);

interface LoadedSettingsNavigationProps {
  data: CourseAdminItems;
}

const LoadedSettingsNavigation = (
  props: LoadedSettingsNavigationProps,
): JSX.Element => {
  const [items, setItems] = useState(props.data);

  useEffect(() => {
    fetchItems().then(setItems);
  }, []);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const reloadItems = useCallback(() => {
    fetchItems().then(setItems);
  }, [fetchItems, setItems]);

  if (!items) return <LoadingIndicator />;

  return (
    <ItemsReloaderContext.Provider value={reloadItems}>
      <div className="flex flex-col">
        <div className="-m-2 pb-10">
          {items.map(({ title, path }) => (
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
    </ItemsReloaderContext.Provider>
  );
};

const SettingsNavigation = (): JSX.Element => (
  <Preload while={fetchItems} render={<LoadingIndicator />}>
    {(data): JSX.Element => <LoadedSettingsNavigation data={data} />}
  </Preload>
);

export default SettingsNavigation;
