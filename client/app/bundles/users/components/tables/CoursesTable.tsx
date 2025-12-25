import { FC } from 'react';
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

import Link from 'lib/components/core/Link';
import { COURSE_USER_ROLES } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import tableTranslations from 'lib/translations/table';

interface Props {
  title: string;
  courses: UserCourseMiniEntity[];
}

const CoursesTable: FC<Props> = ({ title, courses }: Props) => {
  const { t } = useTranslation();
  return (
    <Box style={{ marginBottom: '12px' }}>
      <Typography variant="h6">{title}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              {t(tableTranslations.enrolledAt)}
            </TableCell>
            <TableCell>
              {t(tableTranslations.course)}
            </TableCell>
            <TableCell>{t(tableTranslations.name)}</TableCell>
            <TableCell>{t(tableTranslations.role)}</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
              {t(tableTranslations.level)}
            </TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
              {t(tableTranslations.achievements)}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={`course-${course.id}`} hover>
              <TableCell style={{ maxWidth: '120px' }}>
                {formatLongDateTime(course.enrolledAt)}
              </TableCell>
              <TableCell style={{ maxWidth: '400px' }}>
                <Typography className="course_title" variant="body2">
                  <Link
                    opensInNewTab
                    to={`/courses/${course.id}`}
                    underline="hover"
                  >
                    {course.title}
                  </Link>
                </Typography>
              </TableCell>
              <TableCell>
                <Link
                  opensInNewTab
                  to={`/users/${course.courseUserId}`}
                  underline="hover"
                >
                  {course.courseUserName}
                </Link>
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

export default CoursesTable;
