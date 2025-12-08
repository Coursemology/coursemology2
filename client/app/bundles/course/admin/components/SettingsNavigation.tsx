import { createContext, useCallback, useContext, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  LoaderFunction,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Chip } from '@mui/material';
import { CourseAdminItems } from 'types/course/admin/course';

import CourseAPI from 'api/course';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { DataHandle } from 'lib/hooks/router/dynamicNest';
import useTranslation from 'lib/hooks/useTranslation';

import {
  getComponentTitle,
  getComponentTranslationKey,
} from '../../translations';

const translations = defineMessages({
  courseSettings: {
    id: 'course.admin.courseSettings',
    defaultMessage: 'Course Settings',
  },
});

const fetchItems = async (): Promise<CourseAdminItems> => {
  const response = await CourseAPI.admin.course.items();
  return response.data;
};

const ItemsReloaderContext = createContext(() => {});

export const useItemsReloader = (): (() => void) =>
  useContext(ItemsReloaderContext);

const SettingsNavigation = (): JSX.Element => {
  const data = useLoaderData() as CourseAdminItems;
  const { t } = useTranslation();

  const [items, setItems] = useState(data);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const reloadItems = useCallback(() => {
    fetchItems().then(setItems);
  }, [fetchItems, setItems]);

  if (!items) return <LoadingIndicator />;

  return (
    <Page>
      <ItemsReloaderContext.Provider value={reloadItems}>
        <div className="flex flex-col">
          <div className="-m-2 pb-10">
            {items.map((item) => (
              <Chip
                key={item.path}
                className={`m-2 ${item.path === pathname && 'p-[1px]'}`}
                clickable={item.path !== pathname}
                label={getComponentTitle(t, item.id, item.title)}
                onClick={(): void => navigate(item.path)}
                variant={item.path === pathname ? 'filled' : 'outlined'}
              />
            ))}
          </div>

          <Outlet />
        </div>
      </ItemsReloaderContext.Provider>
    </Page>
  );
};

const loader: LoaderFunction = fetchItems;

const handle: DataHandle = (match, location) => {
  const items = match.data as CourseAdminItems;
  const currentItem = items.find(({ path }) => path === location.pathname);

  return {
    shouldRevalidate: true,
    getData: () => ({
      content: [
        {
          title: translations.courseSettings,
        },
        {
          title:
            currentItem?.title ?? getComponentTranslationKey(currentItem?.id),
          url: currentItem?.path,
        },
      ],
    }),
  };
};

export default Object.assign(SettingsNavigation, { loader, handle });
