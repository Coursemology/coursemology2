import { FC, useState } from 'react';
import { Grid } from '@mui/material';
import { CoursesEntity } from 'types/course/courses';
import Pagination from 'lib/components/Pagination';
import SearchBar from 'lib/components/SearchBar';
import { injectIntl, defineMessages } from 'react-intl';
import CourseInfoBox from './CourseInfoBox';

interface Props {
  intl?: any;
  courses: CoursesEntity[];
}

const translations = defineMessages({
  searchBarPlaceholder: {
    id: 'search.placeholder',
    defaultMessage: 'Search by course title',
  },
});

const CourseDisplay: FC<Props> = (props) => {
  const { intl, courses } = props;
  // Ideally 24. Divisble by 2, 3 and 4. Also makes the pagination less awkward and causes less
  // UI jumps when the scroll bar of the webpage is rendered (when expanding descriptions)
  const ITEMS_PER_PAGE = 12;
  const [slicedCourses, setSlicedCorses] = useState(courses);
  const [page, setPage] = useState(1);

  const [shavedCourses, setShavedCourses] = useState(courses);

  const handleSearchBarChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    if (event.target.value === '') {
      setShavedCourses(courses);
    } else {
      setShavedCourses(
        courses.filter((course: CoursesEntity) =>
          course.title.includes(event.target.value),
        ),
      );
    }
  };

  return (
    <>
      <SearchBar
        placeholder={intl.formatMessage(translations.searchBarPlaceholder)}
        onChange={handleSearchBarChange}
      />
      <Pagination
        items={shavedCourses}
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
        items={shavedCourses}
        itemsPerPage={ITEMS_PER_PAGE}
        setSlicedItems={setSlicedCorses}
        page={page}
        setPage={setPage}
      />
    </>
  );
};

export default injectIntl(CourseDisplay);
