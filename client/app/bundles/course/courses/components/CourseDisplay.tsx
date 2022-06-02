import { injectIntl } from 'react-intl';
import { FC, useEffect, useState } from 'react';
import { Pagination, Grid } from '@mui/material';
import { CoursesEntity } from 'types/course/courses';
import CourseInfoBox from './CourseInfoBox';

interface Props {
  courses: CoursesEntity[];
}

const CourseDisplay: FC<Props> = (props) => {
  const { courses } = props;

  const ITEMS_PER_PAGE = 12;
  const count = Math.ceil(courses.length / ITEMS_PER_PAGE);
  const [page, setPage] = useState(1);
  const [slicedCourses, setSlicedCorses] = useState(
    courses.slice(0, ITEMS_PER_PAGE),
  );

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleChange = (_e: React.ChangeEvent<unknown>, pageNum: number) => {
    setPage(pageNum);
  };

  useEffect(() => {
    const begin = (page - 1) * ITEMS_PER_PAGE;
    setSlicedCorses(courses.slice(begin, begin + ITEMS_PER_PAGE));
  }, [page]);

  return (
    <>
      {count > 1 && (
        <Pagination
          style={{ padding: 24, display: 'flex', justifyContent: 'center' }}
          count={count}
          page={page}
          onChange={handleChange}
        />
      )}
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        p={5}
      >
        {slicedCourses.map((course: CoursesEntity) => (
          <CourseInfoBox key={course.id} course={course} />
        ))}
      </Grid>
    </>
  );
};

export default injectIntl(CourseDisplay);
