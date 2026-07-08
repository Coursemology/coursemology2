import { JSX } from 'react';
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

const DATE_FORMAT = 'YYYY-MM-DD';
const MAX_RANGE_DAYS = 365;

/**
 * Fields shared by every Get Help filter. The "primary" entity (assessment for
 * courses, course for system/instance) varies per consumer and is supplied via
 * the `primaryField` prop, so it is intentionally not part of this base shape.
 */
export interface GetHelpFilterFields {
  user: { name: string } | null;
  startDate: string;
  endDate: string;
}

interface PrimaryFieldConfig<F extends GetHelpFilterFields> {
  label: MessageDescriptor;
  options: { title: string }[];
  value: { title: string } | null;
  setValue: (filter: F, value: { title: string } | null) => F;
}

interface PresetDateRangeChipsProps<F extends GetHelpFilterFields> {
  setSelectedFilter: (newFilter: F) => void;
  selectedFilter: F;
  onFilterChange?: (filter: F) => void;
}

const PresetDateRangeChips = <F extends GetHelpFilterFields>({
  setSelectedFilter,
  selectedFilter,
  onFilterChange,
}: PresetDateRangeChipsProps<F>): JSX.Element => {
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

/**
 * Returns the next filter after one date endpoint is changed, keeping the range
 * valid. Returns `null` when `newValue` is missing/invalid (i.e. no change).
 *
 * When an endpoint is moved:
 * - If it crosses the other endpoint, the other endpoint is shifted to preserve
 *   the current range length.
 * - Otherwise the other endpoint is clamped so the range stays <= 365 days.
 */
export const getFilterForDateChange = <F extends GetHelpFilterFields>(
  filter: F,
  newValue: moment.Moment | null,
  field: 'startDate' | 'endDate',
): F | null => {
  if (!newValue?.isValid()) return null;

  if (field === 'startDate') {
    const endDate = moment(filter.endDate);
    if (newValue.isAfter(endDate)) {
      const newEndDate = newValue
        .clone()
        .add(endDate.diff(moment(filter.startDate)));
      return {
        ...filter,
        startDate: newValue.format(DATE_FORMAT),
        endDate: newEndDate.format(DATE_FORMAT),
      };
    }
    const maxEndDate = newValue.clone().add(MAX_RANGE_DAYS, 'days');
    return {
      ...filter,
      startDate: newValue.format(DATE_FORMAT),
      endDate: moment.min(endDate, maxEndDate).format(DATE_FORMAT),
    };
  }

  const startDate = moment(filter.startDate);
  if (newValue.isBefore(startDate)) {
    const newStartDate = newValue
      .clone()
      .subtract(moment(filter.endDate).diff(startDate));
    return {
      ...filter,
      startDate: newStartDate.format(DATE_FORMAT),
      endDate: newValue.format(DATE_FORMAT),
    };
  }
  const minStartDate = newValue.clone().subtract(MAX_RANGE_DAYS, 'days');
  return {
    ...filter,
    startDate: moment.max(startDate, minStartDate).format(DATE_FORMAT),
    endDate: newValue.format(DATE_FORMAT),
  };
};

interface GetHelpFilterProps<F extends GetHelpFilterFields> {
  userOptions: { name: string }[];
  selectedFilter: F;
  setSelectedFilter: (newFilter: F) => void;
  onFilterChange?: (filter: F) => void;
  getDateValidationError: (
    filter: F,
    t: (msg: MessageDescriptor) => string,
  ) => string;
  primaryField: PrimaryFieldConfig<F>;
}

const GetHelpFilter = <F extends GetHelpFilterFields>({
  userOptions,
  selectedFilter,
  setSelectedFilter,
  onFilterChange,
  getDateValidationError,
  primaryField,
}: GetHelpFilterProps<F>): JSX.Element => {
  const { t } = useTranslation();

  const handleFilterChange = (newFilter: F): void => {
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
    const nextFilter = getFilterForDateChange(selectedFilter, newValue, field);
    if (nextFilter) handleFilterChange(nextFilter);
  };

  const helperText = getDateValidationError(selectedFilter, t);
  const sortedPrimaryOptions = [...primaryField.options].sort((a, b) =>
    a.title.localeCompare(b.title),
  );
  const sortedUserOptions = [...userOptions].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <Stack spacing={1} sx={{ mx: 2 }}>
      <Grid columns={4} container>
        <Grid item paddingBottom={1} paddingRight={1} xs={1}>
          <Autocomplete
            clearOnEscape
            disablePortal
            getOptionLabel={(option): string => option.title}
            onChange={(_, value): void =>
              handleFilterChange(primaryField.setValue(selectedFilter, value))
            }
            options={sortedPrimaryOptions}
            renderInput={(params): JSX.Element => (
              <TextField {...params} label={t(primaryField.label)} />
            )}
            value={primaryField.value}
          />
        </Grid>
        <Grid item paddingBottom={1} paddingRight={1} xs={1}>
          <Autocomplete
            clearOnEscape
            disablePortal
            getOptionLabel={(option): string => option.name}
            onChange={(_, value): void =>
              handleFilterChange({ ...selectedFilter, user: value })
            }
            options={sortedUserOptions}
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
                  error: !!helperText,
                },
              }}
              value={getDateValue(selectedFilter.endDate)}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
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

export default GetHelpFilter;
