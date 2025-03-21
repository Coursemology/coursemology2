import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Footer from 'lib/components/core/layouts/Footer';
import {
  DEFAULT_WINDOW_TITLE,
  getLastCrumbTitle,
  useDynamicNest,
} from 'lib/hooks/router/dynamicNest';
import useTranslation, { translatable } from 'lib/hooks/useTranslation';

import BrandingHead from '../components/navigation/BrandingHead';

import { useAppContext } from './AppContainer';

interface CourselessContainerProps {
  withCourseSwitcher?: boolean;
  withGotoCoursesLink?: boolean;
  withUserMenu?: boolean;
}

const CourselessContainer = (props: CourselessContainerProps): JSX.Element => {
  const { t } = useTranslation();

  const context = useAppContext();

  const { crumbs } = useDynamicNest();

  const crumbTitle = getLastCrumbTitle(crumbs);
  const title = translatable(crumbTitle) ? t(crumbTitle) : crumbTitle;

  useEffect(() => {
    document.title = title ?? DEFAULT_WINDOW_TITLE;
  }, [title]);

  return (
    <div className="flex h-full w-full flex-col">
      <header>
        <BrandingHead
          title={title}
          withCourseSwitcher={props.withCourseSwitcher}
          withGotoCoursesLink={props.withGotoCoursesLink}
          withUserMenu={props.withUserMenu}
        />
      </header>

      <div className="relative h-full">
        <div className="min-h-[calc(100vh_-_4.5rem)] w-full">
          <Outlet context={context} />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default CourselessContainer;
