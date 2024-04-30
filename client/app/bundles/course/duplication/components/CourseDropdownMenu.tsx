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
  additionalClassName: string;
  prompt: string;
  currentHost: string;
  selectedCourseId: number;
  currentCourseId: number;
  courses: DestinationCourse[];
}

const CourseDropdownMenu: FC<CourseDropdownMenuProps> = (props) => {
  const {
    additionalClassName,
    prompt,
    currentHost,
    courses,
    currentCourseId,
    selectedCourseId,
  } = props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <>
      <Typography className="mt-6">{prompt}</Typography>
      <div className="flex flex-row">
        <Select
          className={`w-full shadow-md m-1 rounded-md ${additionalClassName}`}
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
            onClick={() =>
              dispatch(actions.setDestinationCourseId(currentCourseId))
            }
          >
            <MyLocation
              className={`${currentCourseId === selectedCourseId && 'fill-blue-500'}`}
            />
          </IconButton>
        </Tooltip>
      </div>
    </>
  );
};

export default CourseDropdownMenu;
