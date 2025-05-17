import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const materialsRouter: Translated<RouteObject> = (_) => ({
  path: 'materials/folders',
  lazy: async (): Promise<RouteObject> => ({
    handle: (
      await import(
        /* webpackChunkName: 'folderHandle' */
        'course/material/folders/handles'
      )
    ).folderHandle,
  }),
  // `:folderId` must be split this way so that `folderHandle` is matched
  // to the stable (non-changing) match of `/materials/folders`. This allows
  // the crumbs in the Workbin to not disappear when revalidated by the
  // Dynamic Nest API's builder.
  children: [
    {
      index: true,
      lazy: async (): Promise<RouteObject> => ({
        Component: (
          await import(
            /* webpackChunkName: 'FolderShow' */
            'course/material/folders/pages/FolderShow'
          )
        ).default,
      }),
    },
    {
      path: ':folderId',
      children: [
        {
          index: true,
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'FolderShow' */
                'course/material/folders/pages/FolderShow'
              )
            ).default,
          }),
        },
        {
          path: 'files/:materialId',
          lazy: async (): Promise<RouteObject> => {
            const [
              materialLoader,
              ErrorRetrievingFilePage,
              DownloadingFilePage,
            ] = await Promise.all([
              import(
                /* webpackChunkName: 'materialLoader' */
                'course/material/materialLoader'
              ).then((module) => module.default),
              import(
                /* webpackChunkName: 'ErrorRetrievingFilePage' */
                'course/material/files/ErrorRetrievingFilePage'
              ).then((module) => module.default),
              import(
                /* webpackChunkName: 'DownloadingFilePage' */
                'course/material/files/DownloadingFilePage'
              ).then((module) => module.default),
            ]);

            return {
              loader: materialLoader,
              errorElement: <ErrorRetrievingFilePage />,
              element: <DownloadingFilePage />,
            };
          },
        },
      ],
    },
  ],
});

export default materialsRouter;
