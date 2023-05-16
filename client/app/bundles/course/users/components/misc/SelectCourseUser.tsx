import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Box, TextField } from '@mui/material';
import { CourseUserBasicMiniEntity } from 'types/course/courseUsers';

import { getCourseURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppSelector } from 'lib/hooks/store';

import { getAllUserOptionMiniEntities } from '../../selectors';

interface Props extends WrappedComponentProps {
  initialUser?: CourseUserBasicMiniEntity | null;
}

const translations = defineMessages({
  placeholder: {
    id: 'course.users.SelectCourseUser.placeholder',
    defaultMessage: 'No course user selected',
  },
});

const SelectCourseUser: FC<Props> = (props) => {
  const { initialUser = null, intl } = props;
  const users = useAppSelector(getAllUserOptionMiniEntities);
  const [user, setUser] = useState<CourseUserBasicMiniEntity | null>(
    initialUser,
  );
  const navigate = useNavigate();

  const handleChange = (_, value: CourseUserBasicMiniEntity | null): void => {
    if (value) {
      setUser(value);
      const url = `${getCourseURL(getCourseId())}/users/${
        value.id
      }/personal_times`;
      navigate(url);
    }
  };

  return (
    <Autocomplete
      getOptionLabel={(option): string => option.name}
      id="filter-course-user"
      isOptionEqualToValue={(option, value): boolean => option.id === value.id}
      onChange={handleChange}
      options={users}
      renderInput={(params): JSX.Element => (
        <TextField
          {...params}
          placeholder={intl.formatMessage(translations.placeholder)}
          variant="standard"
        />
      )}
      renderOption={(optionProps, option): JSX.Element => (
        <Box component="li" {...optionProps} key={option.id}>
          {option.name}
        </Box>
      )}
      sx={{ minWidth: '300px', marginRight: '12px' }}
      value={user}
    />
  );
};

export default injectIntl(SelectCourseUser);
