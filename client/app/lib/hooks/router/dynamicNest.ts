import { useEffect } from 'react';
import {
  type CrumbContent as RDBCrumbContent,
  type CrumbData as RDBCrumbData,
  type CrumbPath as RDBCrumbPath,
  type DataHandle as RDBDataHandle,
  forEachFlatCrumb,
  getLastCrumbTitle,
  type Match as RDBMatch,
  useDynamicBreadcrumbs,
} from 'react-dynamic-breadcrumbs';
import { Location, useLocation, useMatches } from 'react-router-dom';

import useTranslation, {
  type Descriptor,
  translatable,
} from '../useTranslation';

type CrumbTitle = string | Descriptor | null | undefined;

export type CrumbData = RDBCrumbData<CrumbTitle>;
export type CrumbContent = RDBCrumbContent<CrumbTitle>;
export type CrumbPath = RDBCrumbPath<CrumbTitle>;
export type DataHandle = RDBDataHandle<
  Location,
  Omit<ReturnType<typeof useMatches>[number], 'handle'>,
  CrumbTitle
>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useDynamicNest = () => {
  const matches = useMatches() as RDBMatch<Location, CrumbTitle>[];
  const location = useLocation();

  return useDynamicBreadcrumbs<Location, CrumbTitle>({
    matches,
    context: location,
  });
};

export const DEFAULT_WINDOW_TITLE = 'Coursemology';

/**
 * The current page's title, from the deepest crumb that has one, which is also set as the window's title. Takes the
 * layout's crumbs rather than calling useDynamicNest again, which would resolve them twice.
 */
export const usePageTitle = (
  crumbs: ReturnType<typeof useDynamicNest>['crumbs'],
): string | null | undefined => {
  const { t } = useTranslation();

  const crumbTitle = getLastCrumbTitle(crumbs);
  const title = translatable(crumbTitle) ? t(crumbTitle) : crumbTitle;

  useEffect(() => {
    document.title = title ?? DEFAULT_WINDOW_TITLE;
  }, [title]);

  return title;
};

export { forEachFlatCrumb, getLastCrumbTitle };
