import { Avatar, Grid, Paper, Typography } from '@mui/material';
import { CourseMiniEntity } from 'types/course/courses';

import { getCourseLogoUrl } from 'course/helper';
import Link from 'lib/components/core/Link';
import { getCourseURL } from 'lib/helpers/url-builders';

interface CourseInfoBoxProps {
  course: CourseMiniEntity;
}

const CourseInfoBox = (props: CourseInfoBoxProps): JSX.Element => {
  const { course } = props;

  return (
    <Grid item lg={1} md={1} sm={1} style={{ padding: 10 }} xl={1} xs={1}>
      <Paper
        className="flex h-full flex-col justify-between"
        variant="outlined"
      >
        <Link
          className="flex h-full flex-col space-y-4 p-4 no-underline hover?:bg-neutral-100"
          to={getCourseURL(course.id)}
        >
          <Avatar
            alt={course.title}
            className="wh-40"
            src={getCourseLogoUrl(course.logoUrl)}
            variant="rounded"
          />

          <Typography color="black" variant="h6">
            {course.title}
          </Typography>
        </Link>

        {course.description && (
          <div className="h-[10rem] shrink-0 overflow-auto p-4 border-only-t-neutral-200">
            <Typography
              dangerouslySetInnerHTML={{ __html: course.description }}
              variant="body2"
            />
          </div>
        )}
      </Paper>
    </Grid>
  );
};

export default CourseInfoBox;
