import { ComponentRef, forwardRef } from 'react';
import { defineMessages } from 'react-intl';
import { CourseLayoutData } from 'types/course/courses';

import BrandingHead from 'lib/components/navigation/BrandingHead';
import useTranslation from 'lib/hooks/useTranslation';

import CourseItem from './CourseItem';
import CourseUserItem from './CourseUserItem';
import SidebarAccordion from './SidebarAccordion';
import SidebarContainer from './SidebarContainer';
import SidebarItem from './SidebarItem';

const translations = defineMessages({
  administration: {
    id: 'course.courses.Sidebar.administration',
    defaultMessage: 'Administration',
  },
});

interface SidebarProps {
  from: CourseLayoutData;
  onChangeVisibility?: (visible: boolean) => void;
  activePath?: string;
}

const Sidebar = forwardRef<ComponentRef<typeof SidebarContainer>, SidebarProps>(
  (props, ref): JSX.Element => {
    const { from: data, onChangeVisibility, activePath } = props;

    const { t } = useTranslation();

    return (
      <SidebarContainer
        ref={ref}
        className="flex w-full max-w-[20rem] flex-col bg-neutral-100 border-only-r-neutral-200"
        onChangeVisibility={onChangeVisibility}
      >
        <section className="border-only-b-neutral-200">
          <BrandingHead.Mini />

          <CourseItem in={data} />

          {data.courseUserName && <CourseUserItem from={data} />}
        </section>

        <section className="h-full space-y-4 overflow-y-scroll px-3 py-4">
          {data.sidebar && (
            <div>
              <SidebarItem.Home
                to={
                  data.homeRedirectsToLearn
                    ? `${data.courseUrl}/home`
                    : data.courseUrl
                }
              />

              {data.sidebar.map((item) => (
                <SidebarItem key={item.key} activePath={activePath} of={item} />
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
        </section>
      </SidebarContainer>
    );
  },
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
