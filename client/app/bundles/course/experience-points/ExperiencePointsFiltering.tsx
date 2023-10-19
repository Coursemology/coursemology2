import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages } from 'react-intl';
import { Autocomplete, Grid, TextField } from '@mui/material';
import {
  ExperiencePointsFilterData,
  ExperiencePointsNameFilterData,
} from 'types/course/experiencePointsRecords';

import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  filter: ExperiencePointsFilterData;
  disabled: boolean;
  studentName: ExperiencePointsNameFilterData | null;
  setSelectedFilter: Dispatch<
    SetStateAction<{
      name: ExperiencePointsNameFilterData | null;
    }>
  >;
  setPageNum: Dispatch<SetStateAction<number>>;
}

const translations = defineMessages({
  filterByNameButton: {
    id: 'course.experiencePoints.filterByNameButton',
    defaultMessage: 'Filter by Name',
  },
});

const ExperiencePointsFiltering: FC<Props> = (props) => {
  const { filter, studentName, setSelectedFilter, setPageNum, disabled } =
    props;

  const { t } = useTranslation();

  return (
    <Grid columns={{ xs: 1, md: 3 }} container>
      <Grid item paddingBottom={1} paddingRight={1} xs={1}>
        <Autocomplete
          clearOnEscape
          disabled={disabled}
          disablePortal
          getOptionLabel={(option): string => option.name}
          onChange={(_, value: { id: number; name: string } | null): void => {
            setPageNum(1);
            setSelectedFilter({
              name: value,
            });
          }}
          options={filter.courseStudents}
          renderInput={(params): JSX.Element => {
            return (
              <TextField
                {...params}
                label={t(translations.filterByNameButton)}
                sx={{ width: 500 }}
                variant="filled"
              />
            );
          }}
          size="small"
          value={studentName}
        />
      </Grid>
    </Grid>
  );
};

export default ExperiencePointsFiltering;
