import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { UserCourseMiniEntity } from 'types/users';

import { COURSE_USER_ROLES } from 'lib/constants/sharedConstants';
import tableTranslations from 'lib/translations/table';

interface Props extends WrappedComponentProps {
  title: string;
  courses: UserCourseMiniEntity[];
}

const CoursesTable: FC<Props> = ({ title, courses, intl }: Props) => {
  return (
    <Box style={{ marginBottom: '12px' }}>
      <Typography variant="h6">{title}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              {intl.formatMessage(tableTranslations.enrolledAt)}
            </TableCell>
            <TableCell>
              {intl.formatMessage(tableTranslations.course)}
            </TableCell>
            <TableCell>{intl.formatMessage(tableTranslations.name)}</TableCell>
            <TableCell>{intl.formatMessage(tableTranslations.role)}</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
              {intl.formatMessage(tableTranslations.level)}
            </TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
              {intl.formatMessage(tableTranslations.achievements)}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={`course-${course.id}`} hover={true}>
              <TableCell style={{ maxWidth: '120px' }}>
                {course.createdAt}
              </TableCell>
              <TableCell style={{ maxWidth: '400px' }}>
                <Typography className="course_title" variant="body2">
                  <a
                    href={`/courses/${course.id}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {course.title}
                  </a>
                </Typography>
              </TableCell>
              <TableCell>
                <a
                  href={`/users/${course.courseUserId}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {course.courseUserName}
                </a>
              </TableCell>
              <TableCell style={{ maxWidth: '100px' }}>
                {COURSE_USER_ROLES[course.courseUserRole]}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {course.courseUserLevel}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {course.courseUserAchievement}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default injectIntl(CoursesTable);
