import { FC } from 'react';
import { MessageDescriptor } from 'react-intl';
import {
  Autocomplete,
  Box,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';
import translations from 'lib/translations/getHelp';

export interface GetHelpFilter {
  assessment: { title: string } | null;
  user: { name: string } | null;
  startDate: string;
  endDate: string;
}

interface Props {
  assessmentOptions: { title: string }[];
  userOptions: { name: string }[];
  selectedFilter: GetHelpFilter;
  setSelectedFilter: (newFilter: GetHelpFilter) => void;
  onFilterChange?: (filter: GetHelpFilter) => void;
  getDateValidationError: (
    filter: GetHelpFilter,
    t: (msg: MessageDescriptor) => string,
  ) => string;
}

interface PresetDateRangeChipsProps {
  setSelectedFilter: (newFilter: GetHelpFilter) => void;
  selectedFilter: GetHelpFilter;
  onFilterChange?: (filter: GetHelpFilter) => void;
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
              onFilterChange?.(newFilter);
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
  assessmentOptions,
  userOptions,
  selectedFilter,
  setSelectedFilter,
  onFilterChange,
  getDateValidationError,
}) => {
  const { t } = useTranslation();

  const handleFilterChange = (newFilter: GetHelpFilter): void => {
    setSelectedFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  const getDateValue = (dateString: string): moment.Moment | null => {
    if (!dateString) return null;
    const date = moment(dateString);
    return date.isValid() ? date : null;
  };

  const handleDateChange = (
    newValue: moment.Moment | null,
    field: 'startDate' | 'endDate',
  ): void => {
    const newFilter = {
      ...selectedFilter,
      [field]: newValue?.isValid() ? newValue.format('YYYY-MM-DD') : '',
    };
    handleFilterChange(newFilter);
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
              assessment: value,
            };
            handleFilterChange(newFilter);
          }}
          options={assessmentOptions}
          renderInput={(params): JSX.Element => (
            <TextField
              {...params}
              label={t(translations.filterAssessmentLabel)}
            />
          )}
          value={selectedFilter.assessment}
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
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DesktopDatePicker
            format="DD/MM/YYYY"
            label={t(translations.filterStartDateLabel)}
            onChange={(newValue) => handleDateChange(newValue, 'startDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                InputLabelProps: { shrink: true },
              },
            }}
            value={getDateValue(selectedFilter.startDate)}
          />
        </LocalizationProvider>
      </Grid>
      <Grid item paddingBottom={1} xs={1}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DesktopDatePicker
            format="DD/MM/YYYY"
            label={t(translations.filterEndDateLabel)}
            onChange={(newValue) => handleDateChange(newValue, 'endDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                InputLabelProps: { shrink: true },
                error: !!getDateValidationError(selectedFilter, t),
              },
            }}
            value={getDateValue(selectedFilter.endDate)}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>
  );
};

const CourseGetHelpFilter: FC<Props> = (props) => {
  const {
    assessmentOptions,
    userOptions,
    selectedFilter,
    setSelectedFilter,
    onFilterChange,
    getDateValidationError,
  } = props;

  const { t } = useTranslation();
  const helperText = getDateValidationError(selectedFilter, t);
  const sortedAssessmentOptions = [...assessmentOptions].sort((a, b) =>
    a.title.localeCompare(b.title),
  );
  const sortedUserOptions = [...userOptions].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <Stack spacing={1} sx={{ mx: 2 }}>
      <FilterFields
        {...props}
        assessmentOptions={sortedAssessmentOptions}
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

export default CourseGetHelpFilter;
