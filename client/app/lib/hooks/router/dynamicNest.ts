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

import type { Descriptor } from '../useTranslation';

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

export { forEachFlatCrumb, getLastCrumbTitle };
