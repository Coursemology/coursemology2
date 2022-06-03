import { injectIntl } from 'react-intl';
import { FC, useState } from 'react';
import { Grid } from '@mui/material';
import { CoursesEntity } from 'types/course/courses';
import Pagination from 'lib/components/Pagination';
import CourseInfoBox from './CourseInfoBox';

interface Props {
  courses: CoursesEntity[];
}

const CourseDisplay: FC<Props> = (props) => {
  const { courses } = props;
  // Ideally 24. Divisble by 2, 3 and 4. Also makes the pagination less awkward and causes less
  // UI jumps when the scroll bar of the webpage is rendered (when expanding descriptions)
  const ITEMS_PER_PAGE = 24;
  const [slicedCourses, setSlicedCorses] = useState(courses);
  const [page, setPage] = useState(1);

  return (
    <>
      <Pagination
        items={courses}
        itemsPerPage={ITEMS_PER_PAGE}
        setSlicedItems={setSlicedCorses}
        page={page}
        setPage={setPage}
      />
      <Grid
        // MUI applies default marginLeft: -16
        style={{ padding: 0 }}
        container
        columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
        p={1}
      >
        {slicedCourses.map((course: CoursesEntity) => (
          <CourseInfoBox key={course.id} course={course} />
        ))}
      </Grid>
      <Pagination
        items={courses}
        itemsPerPage={ITEMS_PER_PAGE}
        setSlicedItems={setSlicedCorses}
        page={page}
        setPage={setPage}
      />
    </>
  );
};

export default injectIntl(CourseDisplay);
