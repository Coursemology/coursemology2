import { Outlet } from 'react-router-dom';

import SidebarLayout from 'lib/components/core/layouts/SidebarLayout';
import { useDynamicNest, usePageTitle } from 'lib/hooks/router/dynamicNest';

import BrandingHead from '../components/navigation/BrandingHead';

import { useAppContext } from './AppContainer';

interface CourselessContainerProps {
  withCourseSwitcher?: boolean;
  withGotoCoursesLink?: boolean;
  withUserMenu?: boolean;
}

const CourselessContainer = (props: CourselessContainerProps): JSX.Element => {
  const context = useAppContext();

  const { crumbs } = useDynamicNest();
  const title = usePageTitle(crumbs);

  return (
    <SidebarLayout
      topBar={() => (
        <header>
          <BrandingHead
            title={title}
            withCourseSwitcher={props.withCourseSwitcher}
            withGotoCoursesLink={props.withGotoCoursesLink}
            withUserMenu={props.withUserMenu}
          />
        </header>
      )}
    >
      <Outlet context={context} />
    </SidebarLayout>
  );
};

export default CourselessContainer;
