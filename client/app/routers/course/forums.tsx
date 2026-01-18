import { RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const forumsRouter: Translated<RouteObject> = (_) => ({
  path: 'forums',
  lazy: async (): Promise<WithRequired<RouteObject, 'handle'>> => ({
    handle: (
      await import(
        /* webpackChunkName: 'forumHandles' */
        'course/forum/handles'
      )
    ).forumHandle,
  }),
  children: [
    {
      index: true,
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'ForumsIndex' */
            'course/forum/pages/ForumsIndex'
          )
        ).default,
      }),
    },
    {
      path: ':forumId',
      lazy: async (): Promise<WithRequired<RouteObject, 'handle'>> => ({
        handle: (
          await import(
            /* webpackChunkName: 'forumHandles' */
            'course/forum/handles'
          )
        ).forumNameHandle,
      }),
      children: [
        {
          index: true,
          lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
            Component: (
              await import(
                /* webpackChunkName: 'ForumShow' */
                'course/forum/pages/ForumShow'
              )
            ).default,
          }),
        },
        {
          path: 'topics/:topicId',
          lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
            const [forumTopicHandle, ForumTopicShow] = await Promise.all([
              import(
                /* webpackChunkName: 'forumHandles' */
                'course/forum/handles'
              ).then((module) => module.forumTopicHandle),
              import(
                /* webpackChunkName: 'ForumTopicShow' */
                'course/forum/pages/ForumTopicShow'
              ).then((module) => module.default),
            ]);

            return {
              Component: ForumTopicShow,
              handle: forumTopicHandle,
            };
          },
        },
      ],
    },
  ],
});
export default forumsRouter;
