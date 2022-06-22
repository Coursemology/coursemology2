import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Autocomplete, Box, TextField } from '@mui/material';
import { CourseUserMiniEntity } from 'types/course/courseUsers';
import { useNavigate } from 'react-router-dom';
import { getCourseURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

interface Props extends WrappedComponentProps {
  users: CourseUserMiniEntity[];
  initialUser?: CourseUserMiniEntity | null;
}

const translations = defineMessages({
  placeholder: {
    id: 'course.users.components.misc.SelectCourseUser.placeholder',
    defaultMessage: 'No course user selected',
  },
});

const SelectCourseUser: FC<Props> = (props) => {
  const { users, initialUser = null, intl } = props;
  const [user, setUser] = useState<CourseUserMiniEntity | null>(initialUser);
  const navigate = useNavigate();

  const handleChange = (
    _e: React.SyntheticEvent,
    value: CourseUserMiniEntity | null,
  ): void => {
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
      id="upgrade-student-name"
      value={user}
      onChange={handleChange}
      options={users}
      getOptionLabel={(option): string => option.name}
      // eslint-disable-next-line @typescript-eslint/no-shadow
      renderOption={(props, option): JSX.Element => (
        <Box component="li" {...props}>
          {option.name}
        </Box>
      )}
      renderInput={(params): JSX.Element => (
        <TextField
          {...params}
          placeholder={intl.formatMessage(translations.placeholder)}
          variant="standard"
        />
      )}
      isOptionEqualToValue={(option, value): boolean => option.id === value.id}
      sx={{ minWidth: '300px', marginRight: '12px' }}
    />
  );
};

export default injectIntl(SelectCourseUser);
