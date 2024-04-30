import { FC } from 'react';
import { defineMessages } from 'react-intl';
import MyLocation from '@mui/icons-material/MyLocation';
import {
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { actions } from '../store';
import { DestinationCourse } from '../types';

import TypeBadge from './TypeBadge';

const translations = defineMessages({
  currentCourse: {
    id: 'course.duplication.CourseDropdownMenu.currentCourse',
    defaultMessage: 'Select Current Course',
  },
});

interface CourseDropdownMenuProps {
  prompt: string;
  currentHost: string;
  selectedCourseId: number;
  currentCourseId: number;
  courses: DestinationCourse[];
}

const CourseDropdownMenu: FC<CourseDropdownMenuProps> = (props) => {
  const { prompt, currentHost, courses, currentCourseId, selectedCourseId } =
    props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <>
      <Typography className="mt-6">{prompt}</Typography>
      <div className="flex flex-row">
        <Select
          className="w-full shadow-md m-1 rounded-md"
          onChange={(event) => {
            dispatch(
              actions.setDestinationCourseId(event.target.value as number),
            );
          }}
          value={selectedCourseId ?? ''}
          variant="standard"
        >
          {courses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {currentHost === course.host ? (
                course.title
              ) : (
                <span>
                  <TypeBadge text={course.host} />
                  {course.title}
                </span>
              )}
            </MenuItem>
          ))}
        </Select>
        <Tooltip title={t(translations.currentCourse)}>
          <IconButton
            color={`${currentCourseId === selectedCourseId ? 'info' : 'default'}`}
            onClick={() =>
              dispatch(actions.setDestinationCourseId(currentCourseId))
            }
          >
            <MyLocation />
          </IconButton>
        </Tooltip>
      </div>
    </>
  );
};

export default CourseDropdownMenu;
