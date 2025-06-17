import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Autocomplete, Button, Grid, Stack, TextField } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

export interface GetHelpFilter {
  course: { id: number; title: string } | null;
  user: { id: number; name: string } | null;
  startDate: string;
  endDate: string;
}

interface Props {
  courseOptions: { id: number; title: string }[];
  userOptions: { id: number; name: string }[];
  selectedFilter: GetHelpFilter;
  setSelectedFilter: (newFilter: GetHelpFilter) => void;
  handleApplyFilter: () => void;
  handleClearFilter: () => void;
}

const translations = defineMessages({
  filterCourseLabel: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.filterCourseLabel',
    defaultMessage: 'Filter by Course',
  },
  filterStudentLabel: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.filterStudentLabel',
    defaultMessage: 'Filter by Student',
  },
  filterStartDateLabel: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.filterStartDateLabel',
    defaultMessage: 'Start Date',
  },
  filterEndDateLabel: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.filterEndDateLabel',
    defaultMessage: 'End Date',
  },
  applyFilterButton: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.applyFilterButton',
    defaultMessage: 'Apply Filter',
  },
  clearFilterButton: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.clearFilterButton',
    defaultMessage: 'Clear Filter',
  },
});

const SystemGetHelpFilter: FC<Props> = (props) => {
  const { t } = useTranslation();
  const {
    courseOptions,
    userOptions,
    selectedFilter,
    setSelectedFilter,
    handleApplyFilter,
    handleClearFilter,
  } = props;
  const disableButton = Object.values(selectedFilter).every((x) => !x);

  // Date range validation
  const hasStart = !!selectedFilter.startDate;
  const hasEnd = !!selectedFilter.endDate;
  let helperText = '';

  if (hasStart && hasEnd) {
    const start = new Date(selectedFilter.startDate);
    const end = new Date(selectedFilter.endDate);

    if (end < start) {
      helperText = 'End Date must be after or equal to Start Date';
    } else {
      const dayDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (dayDiff > 366) {
        helperText = 'Date range cannot exceed 1 year';
      }
    }
  }

  return (
    <Stack spacing={1} sx={{ mx: 2 }}>
      <Grid columns={4} container>
        <Grid item paddingBottom={1} paddingRight={1} xs={1}>
          <Autocomplete
            clearOnEscape
            disablePortal
            getOptionLabel={(option): string => option.title}
            onChange={(_, value): void => {
              setSelectedFilter({
                ...selectedFilter,
                course: value,
              });
            }}
            options={courseOptions}
            renderInput={(params): JSX.Element => (
              <TextField
                {...params}
                label={t(translations.filterCourseLabel)}
              />
            )}
            value={selectedFilter.course}
          />
        </Grid>
        <Grid item paddingBottom={1} paddingRight={1} xs={1}>
          <Autocomplete
            clearOnEscape
            disablePortal
            getOptionLabel={(option): string => option.name}
            onChange={(_, value): void => {
              setSelectedFilter({
                ...selectedFilter,
                user: value,
              });
            }}
            options={userOptions}
            renderInput={(params): JSX.Element => (
              <TextField
                {...params}
                label={t(translations.filterStudentLabel)}
              />
            )}
            value={selectedFilter.user}
          />
        </Grid>
        <Grid item paddingBottom={1} paddingRight={1} xs={1}>
          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            label={t(translations.filterStartDateLabel)}
            onChange={(e): void => {
              setSelectedFilter({
                ...selectedFilter,
                startDate: e.target.value,
              });
            }}
            type="date"
            value={selectedFilter.startDate || ''}
          />
        </Grid>
        <Grid item paddingBottom={1} xs={1}>
          <TextField
            error={
              !!selectedFilter.startDate &&
              !!selectedFilter.endDate &&
              (new Date(selectedFilter.endDate) <
                new Date(selectedFilter.startDate) ||
                (new Date(selectedFilter.endDate).getTime() -
                  new Date(selectedFilter.startDate).getTime()) /
                  (1000 * 60 * 60 * 24) >
                  366)
            }
            fullWidth
            helperText={helperText}
            InputLabelProps={{ shrink: true }}
            label={t(translations.filterEndDateLabel)}
            onChange={(e): void => {
              setSelectedFilter({
                ...selectedFilter,
                endDate: e.target.value,
              });
            }}
            type="date"
            value={selectedFilter.endDate || ''}
          />
        </Grid>
      </Grid>
      <Grid container paddingBottom={1}>
        <Button
          disabled={disableButton}
          onClick={handleApplyFilter}
          variant="contained"
        >
          {t(translations.applyFilterButton)}
        </Button>
        <Button
          className="ml-10"
          color="secondary"
          disabled={disableButton}
          onClick={(): void => {
            setSelectedFilter({
              course: null,
              user: null,
              startDate: '',
              endDate: '',
            });
            handleClearFilter();
          }}
          variant="contained"
        >
          {t(translations.clearFilterButton)}
        </Button>
      </Grid>
    </Stack>
  );
};

export default SystemGetHelpFilter;
