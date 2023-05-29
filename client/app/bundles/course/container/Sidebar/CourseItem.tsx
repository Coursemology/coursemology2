import { useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Avatar, Typography } from '@mui/material';
import { CourseLayoutData } from 'types/course/courses';

import SearchField from 'lib/components/core/fields/SearchField';
import PopupMenu from 'lib/components/core/PopupMenu';
import { useAppContext } from 'lib/containers/AppContainer';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  thisCourse: {
    id: 'course.courses.CourseItem.thisCourse',
    defaultMessage: 'This course',
  },
  jumpToOtherCourses: {
    id: 'course.courses.CourseItem.jumpToOtherCourses',
    defaultMessage: 'Jump to your other courses',
  },
  searchCourses: {
    id: 'course.courses.CourseItem.searchCourses',
    defaultMessage: 'Search courses',
  },
  noCoursesMatch: {
    id: 'course.courses.CourseItem.noCoursesMatch',
    defaultMessage: "Oops, no courses matched '{keyword}'.",
  },
  seeAllCourses: {
    id: 'course.courses.CourseItem.seeAllCourses',
    defaultMessage: 'See all courses',
  },
  createNewCourse: {
    id: 'course.courses.CourseItem.createNewCourse',
    defaultMessage: 'Create a new course',
  },
});

interface CourseItemProps {
  in: CourseLayoutData;
}

const CourseItem = (props: CourseItemProps): JSX.Element => {
  const { in: data } = props;

  const { t } = useTranslation();

  const { courses } = useAppContext();

  const [anchorElement, setAnchorElement] = useState<HTMLElement>();
  const [filterCourseKeyword, setFilterCourseKeyword] = useState('');

  const filteredCourses = useMemo(() => {
    if (!filterCourseKeyword) return courses;

    return courses?.filter((course) =>
      course.title.toLowerCase().includes(filterCourseKeyword.toLowerCase()),
    );
  }, [filterCourseKeyword]);

  return (
    <>
      <div
        className="flex select-none items-center space-x-4 p-4 hover:bg-neutral-200 active:bg-neutral-300"
        onClick={(e): void => setAnchorElement(e.currentTarget)}
        role="button"
        tabIndex={0}
      >
        <Avatar
          alt={data.courseTitle}
          className="aspect-square rounded-xl wh-20"
          src={data.courseLogoUrl}
          variant="rounded"
        />

        <Typography className="line-clamp-3 leading-tight" variant="body2">
          {data.courseTitle}
        </Typography>
      </div>

      <PopupMenu
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onClose={(): void => setAnchorElement(undefined)}
      >
        <PopupMenu.List header={t(translations.thisCourse)}>
          <PopupMenu.Text variant="body1">{data.courseTitle}</PopupMenu.Text>
        </PopupMenu.List>

        <PopupMenu.Divider />

        {Boolean(courses?.length) && (
          <>
            <PopupMenu.List header={t(translations.jumpToOtherCourses)}>
              <PopupMenu.Item>
                <SearchField
                  autoFocus
                  noIcon
                  onChangeKeyword={setFilterCourseKeyword}
                  placeholder={t(translations.searchCourses)}
                />
              </PopupMenu.Item>
            </PopupMenu.List>

            <PopupMenu.List className="-mt-5 max-h-[30rem] overflow-y-scroll sm:max-w-full md:max-w-[50rem]">
              {filteredCourses?.map((course) => (
                <PopupMenu.Button
                  key={course.url}
                  textProps={{ className: 'line-clamp-2' }}
                  to={course.url}
                >
                  {course.title}
                </PopupMenu.Button>
              ))}

              {!filteredCourses?.length && (
                <PopupMenu.Text color="text.secondary">
                  {t(translations.noCoursesMatch, {
                    keyword: filterCourseKeyword,
                  })}
                </PopupMenu.Text>
              )}
            </PopupMenu.List>

            <PopupMenu.Divider />
          </>
        )}

        <PopupMenu.List>
          <PopupMenu.Button to="/courses">
            {t(translations.seeAllCourses)}
          </PopupMenu.Button>

          <PopupMenu.Button to="/courses?new=true">
            {t(translations.createNewCourse)}
          </PopupMenu.Button>
        </PopupMenu.List>
      </PopupMenu>
    </>
  );
};

export default CourseItem;
