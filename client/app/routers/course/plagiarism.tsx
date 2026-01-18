import { RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const plagiarismRouter: Translated<RouteObject> = (_) => ({
  path: 'plagiarism',
  lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
    const PlagiarismIndex = (
      await import(
        /* webpackChunkName: 'PlagiarismIndex' */
        'course/plagiarism/pages/PlagiarismIndex'
      )
    ).default;

    return {
      Component: PlagiarismIndex,
      handle: PlagiarismIndex.handle,
    };
  },
  children: [
    {
      path: 'assessments',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'PlagiarismIndex' */
            'course/plagiarism/pages/PlagiarismIndex'
          )
        ).default,
      }),
    },
  ],
});

export default plagiarismRouter;
