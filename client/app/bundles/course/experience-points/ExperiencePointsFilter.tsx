import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Autocomplete, Button, Grid, Stack, TextField } from '@mui/material';
import {
  ExperiencePointsFilterData,
  ExperiencePointsNameFilterData,
} from 'types/course/experiencePointsRecords';

interface Props extends WrappedComponentProps {
  filter: ExperiencePointsFilterData;
  selectedFilter: {
    name: ExperiencePointsNameFilterData | null;
  };
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
  filterByReasonButton: {
    id: 'course.experiencePoints.filterByReasonButton',
    defaultMessage: 'Filter by Reason',
  },
  applyFilterButton: {
    id: 'course.experiencePoints.applyFilterButton',
    defaultMessage: 'Apply Filter',
  },
  clearFilterButton: {
    id: 'course.experiencePoints.clearFilterButton',
    defaultMessage: 'Clear Filter',
  },
});

const ExperiencePointsFilter: FC<Props> = (props) => {
  const { intl, filter, selectedFilter, setSelectedFilter, setPageNum } = props;
  const disableButton = Object.values(selectedFilter).every((x) => x === null);

  return (
    <Stack className="experience-points-filter" spacing={1}>
      <Grid columns={{ xs: 1, md: 3 }} container>
        <Grid item paddingBottom={1} paddingRight={1} xs={1}>
          <Autocomplete
            key="experience-points-name-selector"
            clearOnEscape
            disablePortal
            getOptionLabel={(option): string => option.name}
            onChange={(_, value: { id: number; name: string } | null): void => {
              setPageNum(1);
              setSelectedFilter({
                ...selectedFilter,
                name: value,
              });
            }}
            options={filter.names}
            renderInput={(params): JSX.Element => {
              return (
                <TextField
                  {...params}
                  label={intl.formatMessage(translations.filterByNameButton)}
                />
              );
            }}
            value={selectedFilter.name}
          />
        </Grid>
      </Grid>
      <Grid container>
        <Button
          color="secondary"
          disabled={disableButton}
          onClick={(): void => {
            setPageNum(1);
            setSelectedFilter({
              name: null,
            });
          }}
          style={{ marginLeft: 10 }}
          variant="contained"
        >
          {intl.formatMessage(translations.clearFilterButton)}
        </Button>
      </Grid>
    </Stack>
  );
};

export default injectIntl(ExperiencePointsFilter);
