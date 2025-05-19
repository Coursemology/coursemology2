import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const videosRouter: Translated<RouteObject> = (t) => ({
  path: 'videos',
  lazy: async (): Promise<RouteObject> => ({
    handle: (
      await import(
        /* webpackChunkName: 'videoHandles' */
        'course/video/handles'
      )
    ).videosHandle,
  }),
  children: [
    {
      index: true,
      lazy: async (): Promise<RouteObject> => ({
        Component: (
          await import(
            /* webpackChunkName: 'VideosIndex' */
            'course/video/pages/VideosIndex'
          )
        ).default,
      }),
    },
    {
      path: ':videoId',
      lazy: async (): Promise<RouteObject> => ({
        handle: (
          await import(
            /* webpackChunkName: 'videoHandles' */
            'course/video/handles'
          )
        ).videoHandle,
      }),
      children: [
        {
          index: true,
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'VideoShow' */
                'course/video/pages/VideoShow'
              )
            ).default,
          }),
        },
        {
          path: 'submissions',
          children: [
            {
              index: true,
              lazy: async (): Promise<RouteObject> => {
                const VideoSubmissionsIndex = (
                  await import(
                    /* webpackChunkName: 'VideoSubmissionsIndex' */
                    'course/video/submission/pages/VideoSubmissionsIndex'
                  )
                ).default;

                return {
                  Component: VideoSubmissionsIndex,
                  handle: VideoSubmissionsIndex.handle,
                };
              },
            },
            {
              path: ':submissionId',
              lazy: async (): Promise<RouteObject> => ({
                handle: (
                  await import(
                    /* webpackChunkName: 'VideoSubmissionShow' */
                    'course/video/submission/pages/VideoSubmissionShow'
                  )
                ).default.handle,
              }),
              children: [
                {
                  index: true,
                  lazy: async (): Promise<RouteObject> => ({
                    Component: (
                      await import(
                        /* webpackChunkName: 'VideoSubmissionShow' */
                        'course/video/submission/pages/VideoSubmissionShow'
                      )
                    ).default,
                  }),
                },
                {
                  path: 'edit',
                  lazy: async (): Promise<RouteObject> => ({
                    Component: (
                      await import(
                        /* webpackChunkName: 'VideoSubmissionEdit' */
                        'course/video/submission/pages/VideoSubmissionEdit'
                      )
                    ).default,
                  }),
                },
              ],
            },
          ],
        },
        {
          path: 'attempt',
          lazy: async (): Promise<RouteObject> => {
            const videoAttemptLoader = (
              await import(
                /* webpackChunkName: 'videoAttemptLoader' */
                'course/video/attemptLoader'
              )
            ).default;

            return { loader: videoAttemptLoader(t) };
          },
        },
      ],
    },
  ],
});

export default videosRouter;
