import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Avatar, Typography } from '@mui/material';
import { CourseLayoutData } from 'types/course/courses';

import PopupMenu from 'lib/components/core/PopupMenu';
import UserPopupMenuList from 'lib/components/navigation/UserPopupMenuList';
import { COURSE_USER_ROLES } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

import CourseUserProgress from './CourseUserProgress';
import LevelRing from './LevelRing';

const translations = defineMessages({
  differentCourseNameHint: {
    id: 'course.courses.CourseUserItem.differentCourseNameHint',
    defaultMessage:
      "You're seeing a name different from your account name because this course's manager invited " +
      'you with this name.',
  },
  goToYourProfile: {
    id: 'course.courses.CourseUserItem.goToYourProfile',
    defaultMessage: 'Go to your profile',
  },
  manageEmailSubscriptions: {
    id: 'course.courses.CourseUserItem.manageEmailSubscriptions',
    defaultMessage: 'Manage email subscriptions',
  },
  inThisCourse: {
    id: 'course.courses.CourseUserItem.inThisCourse',
    defaultMessage: 'In this course',
  },
  inCoursemology: {
    id: 'course.courses.CourseUserItem.inCoursemology',
    defaultMessage: 'In Coursemology',
  },
  notInThisCourse: {
    id: 'course.courses.CourseUserItem.notInThisCourse',
    defaultMessage: 'Not in this course',
  },
  notInThisCourseHint: {
    id: 'course.courses.CourseUserItem.notInThisCourseHint',
    defaultMessage:
      'You are not a user in this course. So, you can only view publicly available information about this course. ' +
      "You may contact this course's instructor to be invited to this course.",
  },
});

interface CourseUserItemProps {
  from: CourseLayoutData;
}

interface CourseUserNameAndRoleProps {
  from: CourseLayoutData;
}

const CourseUserNameAndRole = (
  props: CourseUserNameAndRoleProps,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <Typography
        className="overflow-hidden text-ellipsis whitespace-nowrap"
        variant="body2"
      >
        {props.from.courseUserName ?? props.from.userName}
      </Typography>

      <Typography
        className="overflow-hidden text-ellipsis whitespace-nowrap"
        color="text.secondary"
        variant="caption"
      >
        {COURSE_USER_ROLES[props.from.courseUserRole!] ??
          t(translations.notInThisCourse)}
      </Typography>
    </>
  );
};

const SimpleCourseUserItemContent = (
  props: CourseUserItemProps,
): JSX.Element => (
  <div className="flex items-center space-x-4">
    <Avatar
      alt={props.from.courseUserName ?? props.from.userName}
      src={props.from.userAvatarUrl}
    />

    <div className="relative mt-[3px] flex min-w-0 flex-col">
      <CourseUserNameAndRole from={props.from} />
    </div>
  </div>
);

const MaxLevelCrown = (): JSX.Element => (
  <Typography className="absolute -left-2 -top-6 -rotate-12 drop-shadow-lg">
    👑
  </Typography>
);

const CourseUserItemContent = (props: CourseUserItemProps): JSX.Element => {
  const { from: data } = props;

  if (!data.progress) return <SimpleCourseUserItemContent from={data} />;

  return (
    <>
      <div className="flex items-center space-x-4">
        <LevelRing in={data.progress}>
          <Avatar alt={data.courseUserName} src={data.userAvatarUrl} />
        </LevelRing>

        <div className="relative mt-[3px] flex min-w-0 flex-col">
          {data.progress.nextLevelExpDelta === 'max' && <MaxLevelCrown />}
          <CourseUserNameAndRole from={data} />
        </div>
      </div>

      <CourseUserProgress from={data.progress} />
    </>
  );
};

const CourseUserItem = (props: CourseUserItemProps): JSX.Element => {
  const { from: data } = props;

  const { t } = useTranslation();

  const [anchorElement, setAnchorElement] = useState<HTMLElement>();

  return (
    <>
      <div
        className="group/user flex select-none flex-col space-y-5 p-4 hover:bg-neutral-200 active:bg-neutral-300"
        onClick={(e): void => setAnchorElement(e.currentTarget)}
        role="button"
        tabIndex={0}
      >
        <CourseUserItemContent from={data} />
      </div>

      <PopupMenu
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onClose={(): void => setAnchorElement(undefined)}
      >
        {data.courseUserName ? (
          <>
            {data.userName !== data.courseUserName && (
              <>
                <PopupMenu.Text
                  className="max-w-[20rem] leading-tight"
                  color="text.disabled"
                  variant="caption"
                >
                  {t(translations.differentCourseNameHint)}
                </PopupMenu.Text>

                <PopupMenu.Divider />
              </>
            )}

            <PopupMenu.List header={t(translations.inThisCourse)}>
              <PopupMenu.Button to={data.courseUserUrl}>
                {t(translations.goToYourProfile)}
              </PopupMenu.Button>

              {data.manageEmailSubscriptionUrl && (
                <PopupMenu.Button to={data.manageEmailSubscriptionUrl}>
                  {t(translations.manageEmailSubscriptions)}
                </PopupMenu.Button>
              )}
            </PopupMenu.List>
          </>
        ) : (
          <PopupMenu.Text
            className="max-w-[20rem] leading-tight"
            color="text.disabled"
            variant="caption"
          >
            {t(translations.notInThisCourseHint)}
          </PopupMenu.Text>
        )}

        <PopupMenu.Divider />

        <UserPopupMenuList header={t(translations.inCoursemology)} />
      </PopupMenu>
    </>
  );
};

export default CourseUserItem;
