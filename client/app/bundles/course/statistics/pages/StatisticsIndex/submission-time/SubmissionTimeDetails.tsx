import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { CourseUserBasicListData } from 'types/course/courseUsers';

import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  students: CourseUserBasicListData[];
}

const translations = defineMessages({
  placeholder: {
    id: 'course.statistics.SubmissionTime.placeholder',
    defaultMessage: 'No students selected',
  },
  autocompleteTitle: {
    id: 'course.statistics.SubmissionTime.autocompleteTitle',
    defaultMessage: 'Student Name',
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

  return (
    <div className="m-2 p-2">
      <Typography variant="h6">{t(translations.autocompleteTitle)}</Typography>
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
      <Typography className="mt-6" variant="h6">
        {selectedStudent?.name ?? ''}
      </Typography>
    </div>
  );
};

export default SubmissionTimeDetails;
