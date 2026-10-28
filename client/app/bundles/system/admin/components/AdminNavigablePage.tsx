import { ReactElement } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Page from 'lib/components/core/layouts/Page';
import SidebarLayout from 'lib/components/core/layouts/SidebarLayout';
import BrandingHead from 'lib/components/navigation/BrandingHead';
import Breadcrumbs from 'lib/components/navigation/Breadcrumbs';
import SidebarItem from 'lib/components/navigation/sidebar/SidebarItem';
import { useAppContext } from 'lib/containers/AppContainer';
import {
  CrumbData,
  useDynamicNest,
  usePageTitle,
} from 'lib/hooks/router/dynamicNest';

interface Path {
  icon: ReactElement;
  /** Shown instead of `icon` while the page is open. */
  activeIcon?: ReactElement;
  title: string;
  path: string;
}

interface AdminNavigablePageProps {
  paths: Path[];
}

const isUnder = (crumb: CrumbData, path: string): boolean =>
  crumb.pathname === path || crumb.pathname.startsWith(`${path}/`);

// The panel's own crumbs (e.g. "System Admin Panel") would only link to a redirect to its first page, so they are
// shown as plain text. Breadcrumbs renders a crumb without a URL that way.
const withoutLink = (crumb: CrumbData): CrumbData => ({
  ...crumb,
  content: Array.isArray(crumb.content)
    ? crumb.content.map((content) => ({ ...content, url: undefined }))
    : crumb.content && { ...crumb.content, url: undefined },
});

/**
 * The layout of the system and instance admin panels, shaped like a course's: the brand, user menu and pages in a
 * sidebar, beside a top bar with breadcrumbs and the courses menu. These routes sit beside CourselessContainer rather
 * than inside it, so this is their container.
 */
const AdminNavigablePage = (props: AdminNavigablePageProps): JSX.Element => {
  const location = useLocation();
  const context = useAppContext();

  const activeItem = props.paths.find(
    (path) =>
      location.pathname === path.path ||
      location.pathname.startsWith(`${path.path}/`),
  );

  // Admin pages have no crumbs of their own, so the open sidebar item becomes one, after the crumbs leading to it
  // (the panel's) and before any deeper ones.
  const { crumbs: routeCrumbs, loading } = useDynamicNest();
  const crumbs = activeItem
    ? [
        ...routeCrumbs
          .filter((crumb) => !isUnder(crumb, activeItem.path))
          .map(withoutLink),
        {
          id: `admin-sidebar-item-${activeItem.path}`,
          pathname: activeItem.path,
          content: { url: activeItem.path, title: activeItem.title },
        },
        ...routeCrumbs.filter((crumb) => isUnder(crumb, activeItem.path)),
      ]
    : routeCrumbs;
  usePageTitle(crumbs);

  return (
    <SidebarLayout
      sidebar={
        <>
          <section className="border-only-b-neutral-200">
            <BrandingHead.Mini />
          </section>

          <nav className="h-full space-y-4 overflow-y-scroll px-3 py-4">
            <div>
              {props.paths.map((path) => (
                <SidebarItem
                  key={path.path}
                  active={path.path === activeItem?.path}
                  activeIcon={path.activeIcon}
                  icon={path.icon}
                  label={path.title}
                  to={path.path}
                />
              ))}
            </div>
          </nav>
        </>
      }
      topBar={(showSidebarButton) => (
        <div className="flex h-[4.5rem] w-full items-center pr-4">
          {showSidebarButton}

          <Breadcrumbs
            className="h-[4.5rem] w-full overflow-hidden"
            in={crumbs}
            loading={loading}
          />

          <BrandingHead.CoursesButton withCourseSwitcher />
        </div>
      )}
    >
      <Page unpadded>
        <Outlet context={context} />
      </Page>
    </SidebarLayout>
  );
};

export default AdminNavigablePage;
