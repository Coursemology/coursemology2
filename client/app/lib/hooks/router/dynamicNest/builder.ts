import { Location } from 'react-router-dom';

import { buildCrumbData, CrumbData, CrumbState } from './crumbs';
import {
  getHandleData,
  getHandleRequestData,
  getShouldRevalidateCrumb,
} from './handles';
import { isPromise, Match, Promisable } from './utils';

interface CrumbsDataBuilderResult {
  data: Promisable<CrumbData[]>;
  hasPending: boolean;
  invalidCrumbs: Set<string>;
}

export const buildCrumbsData = (
  matches: Match[],
  location: Location,
  state: CrumbState,
): CrumbsDataBuilderResult => {
  const invalidCrumbs = new Set(Object.keys(state));
  const oldCrumbsCount = invalidCrumbs.size;

  let hasPromise = false;
  let newCrumbsCount = 0;

  const delta = matches.reduce<Promisable<CrumbData>[]>((crumbs, match) => {
    const handleData = getHandleData(match, location);
    if (!handleData) return crumbs;

    newCrumbsCount += 1;

    const crumbExists = invalidCrumbs.has(match.pathname);

    if (getShouldRevalidateCrumb(handleData) || crumbExists)
      invalidCrumbs.delete(match.pathname);

    if (getShouldRevalidateCrumb(handleData) || !crumbExists) {
      const content = getHandleRequestData(handleData);

      if (isPromise(content)) {
        hasPromise = true;
        crumbs.push(content.then((data) => buildCrumbData(match, data)));
      } else {
        crumbs.push(buildCrumbData(match, content));
      }
    }

    return crumbs;
  }, []);

  const validCrumbsCount = oldCrumbsCount - invalidCrumbs.size;

  return {
    data: hasPromise ? Promise.all(delta) : (delta as CrumbData[]),
    hasPending: newCrumbsCount > validCrumbsCount,
    invalidCrumbs,
  };
};
