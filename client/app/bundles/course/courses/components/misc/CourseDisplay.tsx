import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Grid } from '@mui/material';
import { CourseMiniEntity } from 'types/course/courses';

import SearchBar from 'lib/components/core/fields/SearchBar';
import Pagination from 'lib/components/core/layouts/Pagination';
import Note from 'lib/components/core/Note';

import CourseInfoBox from './CourseInfoBox';

interface Props extends WrappedComponentProps {
  courses: CourseMiniEntity[];
}

const translations = defineMessages({
  searchBarPlaceholder: {
    id: 'course.courses.componenets.misc.search.placeholder',
    defaultMessage: 'Search by course title',
  },
  noCourse: {
    id: 'course.courses.components.misc.noCourse',
    defaultMessage: 'There is no course yet...',
  },
});

const CourseDisplay: FC<Props> = (props) => {
  const { intl, courses } = props;

  // Ideally 24. Divisble by 2, 3 and 4. Also makes the pagination less awkward
  const ITEMS_PER_PAGE = 24;
  const [slicedCourses, setSlicedCorses] = useState(
    courses.slice(0, ITEMS_PER_PAGE), // To not render all course logos if there are multiple pages
  );
  const [page, setPage] = useState(1);

  const [shavedCourses, setShavedCourses] = useState(courses);

  if (courses.length === 0) {
    return <Note message={intl.formatMessage(translations.noCourse)} />;
  }

  const handleSearchBarChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    if (event.target.value === '') {
      setShavedCourses(courses);
    } else {
      setShavedCourses(
        courses.filter((course: CourseMiniEntity) =>
          course.title
            .toLowerCase()
            .includes(event.target.value.trim().toLowerCase()),
        ),
      );
    }
  };

  return (
    <>
      <Grid columns={{ xs: 1, lg: 3 }} container style={{ padding: 0 }}>
        <Grid
          item
          style={{
            display: 'flex',
            justifyContent: 'left',
          }}
          xs={1}
        >
          <div style={{ paddingTop: 16, paddingBottom: 16 }}>
            <SearchBar
              onChange={handleSearchBarChange}
              placeholder={intl.formatMessage(
                translations.searchBarPlaceholder,
              )}
            />
          </div>
        </Grid>
        <Grid item xs={1}>
          <Pagination
            items={shavedCourses}
            itemsPerPage={ITEMS_PER_PAGE}
            page={page}
            setPage={setPage}
            setSlicedItems={setSlicedCorses}
          />
        </Grid>
        <Grid item xs={1} />
      </Grid>

      <Grid
        // MUI applies default marginLeft: -16
        columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
        container
        p={1}
        style={{ padding: 0 }}
      >
        {slicedCourses.map((course: CourseMiniEntity) => (
          <CourseInfoBox key={course.id} course={course} />
        ))}
      </Grid>
      {slicedCourses.length > 12 && (
        <Pagination
          items={shavedCourses}
          itemsPerPage={ITEMS_PER_PAGE}
          page={page}
          setPage={setPage}
          setSlicedItems={setSlicedCorses}
        />
      )}
    </>
  );
};

export default injectIntl(CourseDisplay);
