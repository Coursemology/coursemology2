import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Autocomplete, Box, TextField } from '@mui/material';
import { CourseUserBasicListData } from 'types/course/courseUsers';

import { fetchSubmissionTimeStatistics } from 'course/statistics/operations';
import { SubmissionTimeStatistics } from 'course/statistics/types';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import SubmissionTimeTable from './SubmissionTimeTable';

interface Props {
  students: CourseUserBasicListData[];
}

const translations = defineMessages({
  placeholder: {
    id: 'course.statistics.SubmissionTime.placeholder',
    defaultMessage: 'Please put the student name here',
  },
});

const SubmissionTimeDetails: FC<Props> = (props) => {
  const { students } = props;
  const { t } = useTranslation();
  const [selectedStudent, setSelectedStudent] =
    useState<CourseUserBasicListData | null>(null);

  const handleChange = (_, value: CourseUserBasicListData | null): void => {
    setSelectedStudent(value);
  };

  const fetchSubmissionTime = (): Promise<SubmissionTimeStatistics> =>
    fetchSubmissionTimeStatistics(selectedStudent!.id);

  return (
    <div className="m-2 p-2">
      <Autocomplete
        className="mr-3 min-w-[300px] mt-3"
        getOptionLabel={(option): string => option.name}
        id="filter-course-user"
        isOptionEqualToValue={(option, value): boolean =>
          option.id === value.id
        }
        onChange={handleChange}
        options={students}
        renderInput={(params): JSX.Element => (
          <TextField
            {...params}
            placeholder={t(translations.placeholder)}
            variant="standard"
          />
        )}
        renderOption={(optionProps, option): JSX.Element => (
          <Box component="li" {...optionProps} key={option.id}>
            {option.name}
          </Box>
        )}
        value={null}
      />
      {selectedStudent && (
        <Preload
          render={<LoadingIndicator />}
          syncsWith={[selectedStudent]}
          while={fetchSubmissionTime}
        >
          {(data) => {
            return <SubmissionTimeTable data={data} />;
          }}
        </Preload>
      )}
    </div>
  );
};

export default SubmissionTimeDetails;
