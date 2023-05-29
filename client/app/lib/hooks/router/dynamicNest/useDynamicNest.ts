import { useEffect, useMemo, useState } from 'react';
import { useLocation, useMatches } from 'react-router-dom';
import produce from 'immer';

import { buildCrumbsData } from './builder';
import { combineCrumbs, CrumbData, CrumbState } from './crumbs';
import { isPromise } from './utils';

interface UseDynamicNestHook {
  crumbs: CrumbData[];
  loading: boolean;
  activePath?: string;
}

const useDynamicNest = (): UseDynamicNestHook => {
  const matches = useMatches();
  const location = useLocation();

  const [state, setState] = useState<CrumbState>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const result = buildCrumbsData(matches, location, state);

    if (isPromise(result.data)) {
      setLoading(result.hasPending);

      result.data
        .then((crumbs) => !ignore && setState(combineCrumbs(crumbs)))
        .finally(() => setLoading(false));
    } else {
      setState(combineCrumbs(result.data));
    }

    setState(
      produce((draft) => {
        result.invalidCrumbs.forEach((pathname) => delete draft[pathname]);
      }),
    );

    return () => {
      ignore = true;
    };
  }, [matches]);

  const crumbs = useMemo(
    () => Object.values(state).sort((a, b) => a.id.localeCompare(b.id)),
    [state],
  );

  const activePath = useMemo(() => {
    for (let index = crumbs.length - 1; index >= 0; index--) {
      const crumb = crumbs[index];

      // Allow the distinction between `undefined` and `null`. If `activePath`
      // is `null`, it means that explicitly there shouldn't be any active paths
      // for the current nest.
      if (crumb.activePath !== undefined) return crumb.activePath ?? '';
    }

    return undefined;
  }, [crumbs]);

  return { crumbs, loading, activePath };
};

export default useDynamicNest;
