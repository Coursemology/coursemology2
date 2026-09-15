import { RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const programmingUpgradeRouter: Translated<RouteObject> = (_) => ({
  path: 'programming_upgrade/questions',
  lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
    const ProgrammingUpgradeIndex = (
      await import(
        /* webpackChunkName: 'ProgrammingUpgradeIndex' */
        'course/programming-upgrade'
      )
    ).default;

    return {
      Component: ProgrammingUpgradeIndex,
      handle: ProgrammingUpgradeIndex.handle,
    };
  },
});

export default programmingUpgradeRouter;
