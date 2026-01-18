import { RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

import achievementsRouter from './achievements';
import adminRouter from './admin';
import assessmentsRouter from './assessments';
import forumsRouter from './forums';
import groupsRouter from './groups';
import lessonPlanRouter from './lessonPlan';
import materialsRouter from './materials';
import plagiarismRouter from './plagiarism';
import scholaisticRouter from './scholaistic';
import statisticsRouter from './statistics';
import surveysRouter from './surveys';
import usersRouter from './users';
import videosRouter from './videos';

const courseRouter: Translated<RouteObject> = (t) => ({
  path: 'courses/:courseId',
  lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
    const CourseContainer = (
      await import(
        /* webpackChunkName: 'CourseContainer' */
        'course/container/CourseContainer'
      )
    ).default;

    return {
      Component: CourseContainer,
      handle: CourseContainer.handle,
      loader: CourseContainer.loader,
    };
  },
  shouldRevalidate: ({ currentParams, nextParams }): boolean => {
    return currentParams.courseId !== nextParams.courseId;
  },
  children: [
    achievementsRouter(t),
    adminRouter(t),
    assessmentsRouter(t),
    forumsRouter(t),
    groupsRouter(t),
    lessonPlanRouter(t),
    materialsRouter(t),
    plagiarismRouter(t),
    statisticsRouter(t),
    surveysRouter(t),
    usersRouter(t),
    videosRouter(t),
    scholaisticRouter(t),
    {
      index: true,
      lazy: async (): Promise<WithRequired<RouteObject, 'element'>> => {
        const [CourseShow, LearnRedirect] = await Promise.all([
          import(
            /* webpackChunkName: 'CourseShow' */
            'course/courses/pages/CourseShow'
          ).then((module) => module.default),
          import(
            /* webpackChunkName: 'LearnRedirect' */
            'course/stories/components/LearnRedirect'
          ).then((module) => module.default),
        ]);

        return {
          element: (
            <LearnRedirect otherwiseRender={<CourseShow />} to="learn" />
          ),
        };
      },
    },
    {
      path: 'home',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'CourseShow' */
            'course/courses/pages/CourseShow'
          )
        ).default,
      }),
    },
    {
      path: 'learn',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const LearnPage = (
          await import(
            /* webpackChunkName: 'LearnPage' */
            'course/stories/pages/LearnPage'
          )
        ).default;

        return {
          Component: LearnPage,
          handle: LearnPage.handle,
        };
      },
    },
    {
      path: 'mission_control',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const MissionControlPage = (
          await import(
            /* webpackChunkName: 'MissionControlPage' */
            'course/stories/pages/MissionControlPage'
          )
        ).default;

        return {
          Component: MissionControlPage,
          handle: MissionControlPage.handle,
        };
      },
    },
    {
      path: 'timelines',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const TimelineDesigner = (
          await import(
            /* webpackChunkName: 'TimelineDesigner' */
            'course/reference-timelines/TimelineDesigner'
          )
        ).default;

        return {
          Component: TimelineDesigner,
          handle: TimelineDesigner.handle,
        };
      },
    },
    {
      path: 'announcements',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const [announcementsHandle, AnnouncementsIndex] = await Promise.all([
          import(
            /* webpackChunkName: 'announcementsHandle' */
            'course/announcements/handles'
          ).then((module) => module.announcementsHandle),
          import(
            /* webpackChunkName: 'AnnouncementsIndex' */
            'course/announcements/pages/AnnouncementsIndex'
          ).then((module) => module.default),
        ]);

        return {
          Component: AnnouncementsIndex,
          handle: announcementsHandle,
        };
      },
    },
    {
      path: 'comments',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const [commentHandle, CommentIndex] = await Promise.all([
          import(
            /* webpackChunkName: 'commentHandle' */
            'course/discussion/topics/handles'
          ).then((module) => module.commentHandle),
          import(
            /* webpackChunkName: 'CommentIndex' */
            'course/discussion/topics/pages/CommentIndex'
          ).then((module) => module.default),
        ]);

        return {
          Component: CommentIndex,
          handle: commentHandle,
        };
      },
    },
    {
      path: 'leaderboard',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const [leaderboardHandle, LeaderboardIndex] = await Promise.all([
          import(
            /* webpackChunkName: 'leaderboardHandle' */
            'course/leaderboard/handles'
          ).then((module) => module.leaderboardHandle),
          import(
            /* webpackChunkName: 'LeaderboardIndex' */
            'course/leaderboard/pages/LeaderboardIndex'
          ).then((module) => module.default),
        ]);

        return {
          Component: LeaderboardIndex,
          handle: leaderboardHandle,
        };
      },
    },
    {
      path: 'learning_map',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'LearningMap' */
            'course/learning-map/containers/LearningMap'
          )
        ).default,
      }),
    },
    {
      path: 'levels',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const LevelsIndex = (
          await import(
            /* webpackChunkName: 'LevelsIndex' */
            'course/level/pages/LevelsIndex'
          )
        ).default;

        return {
          Component: LevelsIndex,
          handle: LevelsIndex.handle,
        };
      },
    },
    {
      path: 'duplication',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const Duplication = (
          await import(
            /* webpackChunkName: 'Duplication' */
            'course/duplication/pages/Duplication'
          )
        ).default;

        return {
          Component: Duplication,
          handle: Duplication.handle,
        };
      },
    },
    {
      path: 'enrol_requests',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const [manageUserHandles, UserRequests] = await Promise.all([
          import(
            /* webpackChunkName: 'userHandles' */
            'course/users/handles'
          ).then((module) => module.manageUserHandles),
          import(
            /* webpackChunkName: 'UserRequests' */
            'course/enrol-requests/pages/UserRequests'
          ).then((module) => module.default),
        ]);

        return {
          Component: UserRequests,
          handle: manageUserHandles.enrolRequests,
        };
      },
    },
    {
      path: 'user_invitations',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const [manageUserHandles, UserRequests] = await Promise.all([
          import(
            /* webpackChunkName: 'userHandles' */
            'course/users/handles'
          ).then((module) => module.manageUserHandles),
          import(
            /* webpackChunkName: 'InvitationsIndex' */
            'course/user-invitations/pages/InvitationsIndex'
          ).then((module) => module.default),
        ]);

        return {
          Component: UserRequests,
          handle: manageUserHandles.invitations,
        };
      },
    },
    {
      path: 'students',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const [manageUserHandles, UserRequests] = await Promise.all([
          import(
            /* webpackChunkName: 'userHandles' */
            'course/users/handles'
          ).then((module) => module.manageUserHandles),
          import(
            /* webpackChunkName: 'ManageStudents' */
            'course/users/pages/ManageStudents'
          ).then((module) => module.default),
        ]);

        return {
          Component: UserRequests,
          handle: manageUserHandles.students,
        };
      },
    },
    {
      path: 'staff',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const [manageUserHandles, UserRequests] = await Promise.all([
          import(
            /* webpackChunkName: 'userHandles' */
            'course/users/handles'
          ).then((module) => module.manageUserHandles),
          import(
            /* webpackChunkName: 'ManageStaff' */
            'course/users/pages/ManageStaff'
          ).then((module) => module.default),
        ]);

        return {
          Component: UserRequests,
          handle: manageUserHandles.staff,
        };
      },
    },
    {
      path: 'experience_points_records',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
        const ExperiencePointsIndex = (
          await import(
            /* webpackChunkName: 'ExperiencePointsIndex' */
            'course/experience-points'
          )
        ).default;

        return {
          Component: ExperiencePointsIndex,
          handle: ExperiencePointsIndex.handle,
        };
      },
    },
  ],
});

export default courseRouter;
