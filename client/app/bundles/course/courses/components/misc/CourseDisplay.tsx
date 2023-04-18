import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Grid } from '@mui/material';
import { CourseMiniEntity } from 'types/course/courses';

import SearchField from 'lib/components/core/fields/SearchField';
import Pagination from 'lib/components/core/layouts/Pagination';
import Note from 'lib/components/core/Note';
import useItems from 'lib/hooks/items/useItems';

import CourseInfoBox from './CourseInfoBox';

interface Props extends WrappedComponentProps {
  courses: CourseMiniEntity[];
}

const translations = defineMessages({
  searchBarPlaceholder: {
    id: 'course.courses.CourseDisplay.searchBarPlaceholder',
    defaultMessage: 'Search by course title',
  },
  noCourse: {
    id: 'course.courses.CourseDisplay.noCourse',
    defaultMessage: 'There is no course yet...',
  },
});

const itemsPerPage = 24;
const searchKeys: (keyof CourseMiniEntity)[] = ['title'];
export const sortFunc = (courses: CourseMiniEntity[]): CourseMiniEntity[] => {
  const sortedCourses = [...courses];
  sortedCourses.sort((a, b) => Date.parse(b.startAt) - Date.parse(a.startAt));
  return sortedCourses;
};

const CourseDisplay: FC<Props> = (props) => {
  const { intl, courses } = props;

  const {
    processedItems: processedCourses,
    handleSearch,
    currentPage,
    totalPages,
    handlePageChange,
  } = useItems(courses, searchKeys, sortFunc, itemsPerPage);

  if (courses.length === 0) {
    return <Note message={intl.formatMessage(translations.noCourse)} />;
  }

  return (
    <>
      <Grid className="flex items-center" columns={{ xs: 1, lg: 3 }} container>
        <Grid className="lg:justify-left flex " item xs={1}>
          <SearchField
            onChangeKeyword={handleSearch}
            placeholder={intl.formatMessage(translations.searchBarPlaceholder)}
          />
        </Grid>
        <Grid item xs={1}>
          <Pagination
            currentPage={currentPage}
            handlePageChange={handlePageChange}
            totalPages={totalPages}
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
        {processedCourses.map((course: CourseMiniEntity) => (
          <CourseInfoBox key={course.id} course={course} />
        ))}
      </Grid>
      {processedCourses.length > 12 && (
        <Pagination
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
        />
      )}
    </>
  );
};

export default injectIntl(CourseDisplay);
