import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';
import { CourseLayoutData } from 'types/course/courses';

import BrandingHead from 'lib/components/navigation/BrandingHead';
import useTranslation from 'lib/hooks/useTranslation';

import CourseItem from './CourseItem';
import CourseSidebarItem from './CourseSidebarItem';
import CourseUserItem from './CourseUserItem';
import SidebarAccordion from './SidebarAccordion';

const translations = defineMessages({
  administration: {
    id: 'course.courses.Sidebar.administration',
    defaultMessage: 'Administration',
  },
  joinCoursemologyMessage: {
    id: 'course.courses.Sidebar.joinCoursemologyMessage',
    defaultMessage:
      'Create a Coursemology account or sign up to join this course.',
  },
});

interface SidebarProps {
  from: CourseLayoutData;
  activePath?: string;
}

/** The course sidebar's contents. SidebarLayout provides the container that pins and minimises it. */
const Sidebar = (props: SidebarProps): JSX.Element => {
  const { from: data, activePath } = props;

  const { t } = useTranslation();

  return (
    <>
      <section className="border-only-b-neutral-200">
        <BrandingHead.Mini />

        <CourseItem in={data} />

        {data.courseUserName && <CourseUserItem from={data} />}
      </section>

      {!data.userName && (
        <section className="border-only-b-neutral-200 px-4 py-3">
          <Typography
            className="text-neutral-500 leading-tight"
            variant="caption"
          >
            {t(translations.joinCoursemologyMessage)}
          </Typography>
        </section>
      )}

      <nav className="h-full space-y-4 overflow-y-scroll px-3 py-4">
        {data.sidebar && (
          <div>
            <CourseSidebarItem.Home
              to={
                data.homeRedirectsToLearn
                  ? `${data.courseUrl}/home`
                  : data.courseUrl
              }
            />

            {data.sidebar.map((item) => (
              <CourseSidebarItem
                key={item.key}
                activePath={activePath}
                of={item}
              />
            ))}
          </div>
        )}

        {data.adminSidebar && (
          <SidebarAccordion
            activePath={activePath}
            containing={data.adminSidebar}
            title={t(translations.administration)}
          />
        )}
      </nav>
    </>
  );
};

export default Sidebar;
