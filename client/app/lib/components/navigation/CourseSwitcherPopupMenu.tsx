import {
  forwardRef,
  MouseEventHandler,
  ReactNode,
  useImperativeHandle,
  useState,
} from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import SearchField from 'lib/components/core/fields/SearchField';
import PopupMenu from 'lib/components/core/PopupMenu';
import { useAppContext } from 'lib/containers/AppContainer';
import { getCourseId } from 'lib/helpers/url-helpers';
import useItems from 'lib/hooks/items/useItems';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  thisCourse: {
    id: 'lib.components.navigation.CourseSwitcherPopupMenu.thisCourse',
    defaultMessage: 'This course',
  },
  jumpToOtherCourses: {
    id: 'lib.components.navigation.CourseSwitcherPopupMenu.jumpToOtherCourses',
    defaultMessage: 'Jump to your other courses',
  },
  searchCourses: {
    id: 'lib.components.navigation.CourseSwitcherPopupMenu.searchCourses',
    defaultMessage: 'Search your courses',
  },
  noCoursesMatch: {
    id: 'lib.components.navigation.CourseSwitcherPopupMenu.noCoursesMatch',
    defaultMessage: 'Oops, no courses matched "{keyword}".',
  },
  seeAllPublicCourses: {
    id: 'lib.components.navigation.CourseSwitcherPopupMenu.seeAllPublicCourses',
    defaultMessage: 'See all public courses',
  },
  seeAllCoursesInAdmin: {
    id: 'lib.components.navigation.CourseSwitcherPopupMenu.seeAllCoursesInAdmin',
    defaultMessage: 'See all courses in Coursemology',
  },
  seeAllCoursesInInstanceAdmin: {
    id: 'lib.components.navigation.CourseSwitcherPopupMenu.seeAllCoursesInInstanceAdmin',
    defaultMessage: 'See all courses in this instance',
  },
  createNewCourse: {
    id: 'lib.components.navigation.CourseSwitcherPopupMenu.createNewCourse',
    defaultMessage: 'Create a new course',
  },
});

interface CourseSwitcherPopupMenuProps {
  children?: ReactNode;
}

interface CourseSwitcherPopupMenuRef {
  open: MouseEventHandler<HTMLElement>;
}

const CourseSwitcherPopupMenu = forwardRef<
  CourseSwitcherPopupMenuRef,
  CourseSwitcherPopupMenuProps
>((props, ref): JSX.Element => {
  const { t } = useTranslation();

  const { courses, user } = useAppContext();

  const [anchorElement, setAnchorElement] = useState<HTMLElement>();

  useImperativeHandle(ref, () => ({
    open: (e) => setAnchorElement(e.currentTarget),
  }));

  const isSuperAdmin = user?.role === 'administrator';
  const isInstanceAdmin = user?.instanceRole === 'administrator';

  const {
    processedItems: filteredCourses,
    handleSearch,
    searchKeyword,
  } = useItems(courses ?? [], ['title']);

  const [showCourseIds, setShowCourseIds] = useState(false);

  return (
    <PopupMenu
      anchorEl={anchorElement}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={(): void => setAnchorElement(undefined)}
    >
      {props.children}

      {Boolean(courses?.length) && (
        <>
          <PopupMenu.List header={t(translations.jumpToOtherCourses)}>
            <PopupMenu.Item>
              <SearchField
                autoFocus
                noIcon
                onChangeKeyword={handleSearch}
                onKeyDown={(e): void => {
                  if (e.key === 'Alt') {
                    e.preventDefault();
                    setShowCourseIds(true);
                  }
                }}
                onKeyUp={(): void => setShowCourseIds(false)}
                placeholder={t(translations.searchCourses)}
              />
            </PopupMenu.Item>
          </PopupMenu.List>

          <PopupMenu.List className="-mt-5 max-h-[30rem] w-full overflow-y-scroll sm:w-[50rem]">
            {filteredCourses?.map((course) => (
              <PopupMenu.Button
                key={course.url}
                disabled={course.id.toString() === getCourseId()}
                linkProps={{ to: course.url }}
                secondary={
                  course.id.toString() === getCourseId() &&
                  t(translations.thisCourse)
                }
                secondaryAction={
                  showCourseIds && (
                    <Typography color="text.secondary" variant="body2">
                      {course.id}
                    </Typography>
                  )
                }
                textProps={{ className: 'line-clamp-2' }}
              >
                {course.title}
              </PopupMenu.Button>
            ))}

            {!filteredCourses?.length && (
              <PopupMenu.Text color="text.secondary">
                {t(translations.noCoursesMatch, {
                  keyword: searchKeyword,
                })}
              </PopupMenu.Text>
            )}
          </PopupMenu.List>

          <PopupMenu.Divider />
        </>
      )}

      <PopupMenu.List>
        <PopupMenu.Button linkProps={{ to: '/courses' }}>
          {t(translations.seeAllPublicCourses)}
        </PopupMenu.Button>

        {isSuperAdmin && (
          <PopupMenu.Button linkProps={{ to: '/admin/courses' }}>
            {t(translations.seeAllCoursesInAdmin)}
          </PopupMenu.Button>
        )}

        {(isSuperAdmin || isInstanceAdmin) && (
          <PopupMenu.Button linkProps={{ to: '/admin/instance/courses' }}>
            {t(translations.seeAllCoursesInInstanceAdmin)}
          </PopupMenu.Button>
        )}

        {user?.canCreateNewCourse && (
          <PopupMenu.Button linkProps={{ to: '/courses?new=true' }}>
            {t(translations.createNewCourse)}
          </PopupMenu.Button>
        )}
      </PopupMenu.List>
    </PopupMenu>
  );
});

CourseSwitcherPopupMenu.displayName = 'CourseSwitcherPopupMenu';

export default CourseSwitcherPopupMenu;
