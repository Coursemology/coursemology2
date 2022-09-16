import { FC, useState } from 'react';
import { Grid } from '@mui/material';
import { CourseMiniEntity } from 'types/course/courses';
import Note from 'lib/components/Note';
import Pagination from 'lib/components/Pagination';
import SearchBar from 'lib/components/SearchBar';
import { injectIntl, defineMessages, WrappedComponentProps } from 'react-intl';
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
      <Grid style={{ padding: 0 }} container columns={{ xs: 1, lg: 3 }}>
        <Grid
          item
          xs={1}
          style={{
            display: 'flex',
            justifyContent: 'left',
          }}
        >
          <div style={{ paddingTop: 16, paddingBottom: 16 }}>
            <SearchBar
              placeholder={intl.formatMessage(
                translations.searchBarPlaceholder,
              )}
              onChange={handleSearchBarChange}
            />
          </div>
        </Grid>
        <Grid item xs={1}>
          <Pagination
            items={shavedCourses}
            itemsPerPage={ITEMS_PER_PAGE}
            setSlicedItems={setSlicedCorses}
            page={page}
            setPage={setPage}
          />
        </Grid>
        <Grid item xs={1} />
      </Grid>

      <Grid
        // MUI applies default marginLeft: -16
        style={{ padding: 0 }}
        container
        columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
        p={1}
      >
        {slicedCourses.map((course: CourseMiniEntity) => (
          <CourseInfoBox key={course.id} course={course} />
        ))}
      </Grid>
      {slicedCourses.length > 12 && (
        <Pagination
          items={shavedCourses}
          itemsPerPage={ITEMS_PER_PAGE}
          setSlicedItems={setSlicedCorses}
          page={page}
          setPage={setPage}
        />
      )}
    </>
  );
};

export default injectIntl(CourseDisplay);
