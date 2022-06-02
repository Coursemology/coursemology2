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
  // Ideally 24. Divisble by 2, 3 and 4. Also makes the pagination less awkward and causes less
  // UI jumps when the scroll bar of the webpage is rendered (when expanding descriptions)
  const ITEMS_PER_PAGE = 24;
  const count = Math.ceil(courses.length / ITEMS_PER_PAGE);
  const [page, setPage] = useState(1);
  const [slicedCourses, setSlicedCorses] = useState(
    courses.slice(0, ITEMS_PER_PAGE),
  );

  const handleChange: (
    _e: React.ChangeEvent<unknown>,
    pageNum: number,
  ) => void = (_e, pageNum) => {
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
          color="primary"
          variant="outlined"
          style={{ padding: 24, display: 'flex', justifyContent: 'center' }}
          count={count}
          page={page}
          onChange={handleChange}
        />
      )}
      <Grid
        // MUI applies default marginLeft: -24
        style={{ marginLeft: -12 }}
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        p={2}
      >
        {slicedCourses.map((course: CoursesEntity) => (
          <CourseInfoBox key={course.id} course={course} />
        ))}
      </Grid>
      {count > 1 && (
        <Pagination
          color="primary"
          variant="outlined"
          style={{ padding: 24, display: 'flex', justifyContent: 'center' }}
          count={count}
          page={page}
          onChange={handleChange}
        />
      )}
    </>
  );
};

export default injectIntl(CourseDisplay);
