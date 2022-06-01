import { injectIntl } from 'react-intl';
import { FC } from 'react';
import { Pagination, Grid } from '@mui/material';
import { CoursesEntity } from 'types/course/courses';
import CourseInfoBox from './CourseInfoBox';

interface Props {
  courses: CoursesEntity[];
}

const CourseDisplay: FC<Props> = (props) => {
  const { courses } = props;
  return (
    <>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        p={5}
      >
        {courses.map((course: CoursesEntity) => (
          <CourseInfoBox key={course.id} course={course} />
        ))}
      </Grid>
      <Pagination
        style={{ padding: 24, display: 'flex', justifyContent: 'center' }}
        count={10}
        showFirstButton
        showLastButton
      />
    </>
  );
};

export default injectIntl(CourseDisplay);
