import { FC } from 'react';
import { defineMessages } from 'react-intl';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

export interface GetHelpFilter {
  course: { title: string } | null;
  user: { name: string } | null;
  startDate: string;
  endDate: string;
}

interface Props {
  courseOptions: { title: string }[];
  userOptions: { name: string }[];
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
  lastSevenDays: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.lastSevenDays',
    defaultMessage: 'Last 7 Days',
  },
  lastFourteenDays: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.lastFourteenDays',
    defaultMessage: 'Last 14 Days',
  },
  lastThirtyDays: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.lastThirtyDays',
    defaultMessage: 'Last 30 Days',
  },
  lastSixMonths: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.lastSixMonths',
    defaultMessage: 'Last 6 Months',
  },
  lastTwelveMonths: {
    id: 'system.admin.admin.components.SystemGetHelpFilter.lastTwelveMonths',
    defaultMessage: 'Last 12 Months',
  },
});

interface PresetDateRangeChipsProps {
  setSelectedFilter: (newFilter: GetHelpFilter) => void;
  selectedFilter: GetHelpFilter;
}

const PresetDateRangeChips: FC<PresetDateRangeChipsProps> = ({
  setSelectedFilter,
  selectedFilter,
}) => {
  const { t } = useTranslation();
  const chips = [
    {
      label: t(translations.lastSevenDays),
      getRange: (): { start: Date; end: Date } => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        return { start, end };
      },
    },
    {
      label: t(translations.lastFourteenDays),
      getRange: (): { start: Date; end: Date } => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 13);
        return { start, end };
      },
    },
    {
      label: t(translations.lastThirtyDays),
      getRange: (): { start: Date; end: Date } => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        return { start, end };
      },
    },
    {
      label: t(translations.lastSixMonths),
      getRange: (): { start: Date; end: Date } => {
        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - 5); // 6 months including current
        start.setDate(1); // Start from the 1st of the month
        return { start, end };
      },
    },
    {
      label: t(translations.lastTwelveMonths),
      getRange: (): { start: Date; end: Date } => {
        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - 11); // 12 months including current
        start.setDate(1); // Start from the 1st of the month
        return { start, end };
      },
    },
  ];

  return (
    <Box display="flex" gap={1}>
      {chips.map((chip) => {
        const { start, end } = chip.getRange();
        return (
          <Chip
            key={chip.label}
            label={chip.label}
            onClick={() => {
              setSelectedFilter({
                ...selectedFilter,
                startDate: start.toISOString().slice(0, 10),
                endDate: end.toISOString().slice(0, 10),
              });
            }}
            size="small"
            variant="outlined"
          />
        );
      })}
    </Box>
  );
};

const getDateValidationError = (filter: GetHelpFilter): string => {
  const { startDate, endDate } = filter;
  if (!startDate || !endDate) return '';

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) return 'End Date must be after or equal to Start Date';

  const dayDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return dayDiff > 366 ? 'Date range cannot exceed 1 year' : '';
};

const FilterFields: FC<
  Omit<Props, 'handleApplyFilter' | 'handleClearFilter'>
> = ({ courseOptions, userOptions, selectedFilter, setSelectedFilter }) => {
  const { t } = useTranslation();

  return (
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
            <TextField {...params} label={t(translations.filterCourseLabel)} />
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
            <TextField {...params} label={t(translations.filterStudentLabel)} />
          )}
          value={selectedFilter.user}
        />
      </Grid>
      <Grid item paddingBottom={1} paddingRight={1} xs={1}>
        <TextField
          fullWidth
          InputLabelProps={{ shrink: true }}
          label={t(translations.filterStartDateLabel)}
          onChange={(e) =>
            setSelectedFilter({ ...selectedFilter, startDate: e.target.value })
          }
          type="date"
          value={selectedFilter.startDate || ''}
        />
      </Grid>
      <Grid item paddingBottom={1} xs={1}>
        <TextField
          error={!!getDateValidationError(selectedFilter)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          label={t(translations.filterEndDateLabel)}
          onChange={(e) =>
            setSelectedFilter({ ...selectedFilter, endDate: e.target.value })
          }
          type="date"
          value={selectedFilter.endDate || ''}
        />
      </Grid>
    </Grid>
  );
};

const FilterButtons: FC<
  Pick<
    Props,
    'handleApplyFilter' | 'handleClearFilter' | 'setSelectedFilter'
  > & {
    selectedFilter: GetHelpFilter;
    dateValidationError: string;
  }
> = ({
  selectedFilter,
  setSelectedFilter,
  handleApplyFilter,
  handleClearFilter,
  dateValidationError,
}) => {
  const { t } = useTranslation();
  const disableButton =
    !selectedFilter.startDate ||
    !selectedFilter.endDate ||
    !!dateValidationError;

  return (
    <Grid item>
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
        onClick={() => {
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
  );
};

const SystemGetHelpFilter: FC<Props> = (props) => {
  const {
    courseOptions,
    userOptions,
    selectedFilter,
    setSelectedFilter,
    handleApplyFilter,
    handleClearFilter,
  } = props;

  const helperText = getDateValidationError(selectedFilter);
  const sortedCourseOptions = [...courseOptions].sort((a, b) =>
    a.title.localeCompare(b.title),
  );
  const sortedUserOptions = [...userOptions].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <Stack spacing={1} sx={{ mx: 2 }}>
      <FilterFields
        {...props}
        courseOptions={sortedCourseOptions}
        userOptions={sortedUserOptions}
      />
      <Grid
        alignItems="flex-start"
        container
        justifyContent="space-between"
        paddingBottom={1}
      >
        <FilterButtons
          {...props}
          dateValidationError={helperText}
          handleApplyFilter={handleApplyFilter}
          handleClearFilter={handleClearFilter}
        />
        <Grid alignItems="center" display="flex" gap={2} item>
          {helperText && (
            <Typography color="error" variant="caption">
              {helperText}
            </Typography>
          )}
          <PresetDateRangeChips
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default SystemGetHelpFilter;
