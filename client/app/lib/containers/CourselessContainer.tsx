import { Outlet } from 'react-router-dom';

import Footer from 'lib/components/core/layouts/Footer';
import {
  CrumbData,
  CrumbTitle,
  useDynamicNest,
} from 'lib/hooks/router/dynamicNest';
import useTranslation, { translatable } from 'lib/hooks/useTranslation';

import BrandingHead from '../components/navigation/BrandingHead';

import { useAppContext } from './AppContainer';

const getLastCrumbTitle = (crumbs: CrumbData[]): CrumbTitle | null => {
  const content = crumbs[crumbs.length - 1]?.content;
  if (!content) return null;

  const actualContent = Array.isArray(content)
    ? content[content.length - 1]
    : content;
  if (!actualContent) return null;

  return actualContent.title;
};

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
