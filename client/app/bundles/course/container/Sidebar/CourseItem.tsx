import { ComponentRef, useRef } from 'react';
import { Avatar, Typography } from '@mui/material';
import { CourseLayoutData } from 'types/course/courses';

import { getCourseLogoUrl } from 'course/helper';
import PopupMenu from 'lib/components/core/PopupMenu';
import CourseSwitcherPopupMenu from 'lib/components/navigation/CourseSwitcherPopupMenu';

interface CourseItemProps {
  in: CourseLayoutData;
}

const CourseItem = (props: CourseItemProps): JSX.Element => {
  const { in: data } = props;

  const menuRef = useRef<ComponentRef<typeof CourseSwitcherPopupMenu>>(null);

  return (
    <>
      <div
        className="flex select-none items-center space-x-4 p-4 hover:bg-neutral-200 active:bg-neutral-300"
        onClick={(e): void => menuRef.current?.open(e)}
        role="button"
        tabIndex={0}
      >
        <Avatar
          alt={data.courseTitle}
          className="aspect-square rounded-xl wh-20"
          src={getCourseLogoUrl(data.courseLogoUrl)}
          variant="rounded"
        />

        <Typography className="line-clamp-3 leading-tight" variant="body2">
          {data.courseTitle}
        </Typography>
      </div>

      <CourseSwitcherPopupMenu ref={menuRef}>
        <PopupMenu.Text className="font-medium" variant="body2">
          {data.courseTitle}
        </PopupMenu.Text>

        <PopupMenu.Divider />
      </CourseSwitcherPopupMenu>
    </>
  );
};

export default CourseItem;
