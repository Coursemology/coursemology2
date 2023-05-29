import { Outlet } from 'react-router-dom';

import Footer from 'lib/components/core/layouts/Footer';
import {
  CrumbData,
  CrumbTitle,
  useDynamicNest,
} from 'lib/hooks/router/dynamicNest';
import useTranslation, { translatable } from 'lib/hooks/useTranslation';

import BrandingHead from '../components/navigation/BrandingHead';

const getLastCrumbTitle = (crumbs: CrumbData[]): CrumbTitle | null => {
  const content = crumbs.at(-1)?.content;
  if (!content) return null;

  const actualContent = Array.isArray(content) ? content.at(-1) : content;
  if (!actualContent) return null;

  return actualContent.title;
};

/**
 * Container for non-course pages. Pending name and design.
 */
const CourselessContainer = (): JSX.Element => {
  const { t } = useTranslation();

  const { crumbs } = useDynamicNest();

  const crumbTitle = getLastCrumbTitle(crumbs);
  const title = translatable(crumbTitle) ? t(crumbTitle) : crumbTitle;

  return (
    <div className="flex h-full w-full flex-col">
      <header className="border-only-b-neutral-200">
        <BrandingHead title={title} />
      </header>

      <div className="relative h-full">
        <main className="min-h-[calc(100%_-_4rem)] w-full">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default CourselessContainer;
