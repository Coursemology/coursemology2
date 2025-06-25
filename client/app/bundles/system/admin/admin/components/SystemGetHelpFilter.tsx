import { FC } from 'react';
import { defineMessages, MessageDescriptor } from 'react-intl';
import {
  Autocomplete,
  Box,
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
  onFilterChange: (filter: GetHelpFilter) => void;
  getDateValidationError: (
    filter: GetHelpFilter,
    t: (msg: MessageDescriptor) => string,
  ) => string;
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
  onFilterChange: (filter: GetHelpFilter) => void;
}

const PresetDateRangeChips: FC<PresetDateRangeChipsProps> = ({
  setSelectedFilter,
  selectedFilter,
  onFilterChange,
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

  // Helper to check if the current date filter matches a preset
  const isPresetSelected = (start: Date, end: Date): boolean => {
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    return (
      selectedFilter.startDate === startStr && selectedFilter.endDate === endStr
    );
  };

  return (
    <Box display="flex" gap={1}>
      {chips.map((chip) => {
        const { start, end } = chip.getRange();
        const selected = isPresetSelected(start, end);
        return (
          <Chip
            key={chip.label}
            color={selected ? 'primary' : 'default'}
            label={chip.label}
            onClick={() => {
              const newFilter = {
                ...selectedFilter,
                startDate: start.toISOString().slice(0, 10),
                endDate: end.toISOString().slice(0, 10),
              };
              setSelectedFilter(newFilter);
              onFilterChange(newFilter);
            }}
            size="small"
            variant={selected ? 'filled' : 'outlined'}
          />
        );
      })}
    </Box>
  );
};

const FilterFields: FC<Props> = ({
  courseOptions,
  userOptions,
  selectedFilter,
  setSelectedFilter,
  onFilterChange,
  getDateValidationError,
}) => {
  const { t } = useTranslation();

  const handleFilterChange = (newFilter: GetHelpFilter): void => {
    setSelectedFilter(newFilter);
    onFilterChange(newFilter);
  };

  return (
    <Grid columns={4} container>
      <Grid item paddingBottom={1} paddingRight={1} xs={1}>
        <Autocomplete
          clearOnEscape
          disablePortal
          getOptionLabel={(option): string => option.title}
          onChange={(_, value): void => {
            const newFilter = {
              ...selectedFilter,
              course: value,
            };
            handleFilterChange(newFilter);
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
            const newFilter = {
              ...selectedFilter,
              user: value,
            };
            handleFilterChange(newFilter);
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
          onChange={(e) => {
            const newFilter = { ...selectedFilter, startDate: e.target.value };
            handleFilterChange(newFilter);
          }}
          type="date"
          value={selectedFilter.startDate || ''}
        />
      </Grid>
      <Grid item paddingBottom={1} xs={1}>
        <TextField
          error={!!getDateValidationError(selectedFilter, t)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          label={t(translations.filterEndDateLabel)}
          onChange={(e) => {
            const newFilter = { ...selectedFilter, endDate: e.target.value };
            handleFilterChange(newFilter);
          }}
          type="date"
          value={selectedFilter.endDate || ''}
        />
      </Grid>
    </Grid>
  );
};

const SystemGetHelpFilter: FC<Props> = (props) => {
  const {
    courseOptions,
    userOptions,
    selectedFilter,
    setSelectedFilter,
    onFilterChange,
    getDateValidationError,
  } = props;

  const { t } = useTranslation();
  const helperText = getDateValidationError(selectedFilter, t);
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
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Box alignItems="center" display="flex" gap={2}>
            <Typography color="error" variant="caption">
              {helperText}
            </Typography>
            <PresetDateRangeChips
              onFilterChange={onFilterChange}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
            />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default SystemGetHelpFilter;
