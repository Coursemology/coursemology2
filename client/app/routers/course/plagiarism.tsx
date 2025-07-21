import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const plagiarismRouter: Translated<RouteObject> = (_) => ({
  path: 'plagiarism',
  lazy: async (): Promise<RouteObject> => {
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
      lazy: async (): Promise<RouteObject> => ({
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
