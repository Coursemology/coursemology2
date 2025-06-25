import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, MessageDescriptor } from 'react-intl';
import { Typography } from '@mui/material';

import { SystemGetHelpActivity } from 'course/statistics/types';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import useTranslation from 'lib/hooks/useTranslation';

import SystemGetHelpFilter, {
  GetHelpFilter,
} from '../components/SystemGetHelpFilter';
import SystemGetHelpActivityTable from '../components/tables/SystemGetHelpActivityTable';
import { fetchSystemGetHelpActivity } from '../operations';

const translations = defineMessages({
  header: {
    id: 'system.admin.admin.pages.SystemGetHelpActivityIndex.header',
    defaultMessage: 'Recent Get Help Activity',
  },
  invalidDateSelection: {
    id: 'system.admin.admin.pages.SystemGetHelpActivityIndex.invalidDateSelection',
    defaultMessage: 'End Date must be after or equal to Start Date',
  },
  exceedDateRange: {
    id: 'system.admin.admin.pages.SystemGetHelpActivityIndex.exceedDateRange',
    defaultMessage: 'Date range cannot exceed 365 days',
  },
});

const getDefaultDateRange = (): { startDate: string; endDate: string } => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6); // 7 days including today
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const defaultFilter: GetHelpFilter = {
  course: null,
  user: null,
  ...getDefaultDateRange(),
};
const getDateValidationError = (
  filter: GetHelpFilter,
  t: (message: MessageDescriptor) => string,
): string => {
  const { startDate, endDate } = filter;
  if (!startDate || !endDate) return '';

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) return t(translations.invalidDateSelection);

  const dayDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return dayDiff > 365 ? t(translations.exceedDateRange) : '';
};

const SystemGetHelpActivityIndex: FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<SystemGetHelpActivity[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] =
    useState<GetHelpFilter>(defaultFilter);
  const [appliedFilter, setAppliedFilter] =
    useState<GetHelpFilter>(defaultFilter);

  // Track the last fetched date range
  const lastFetchedDateRange = useRef<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  const fetchData = useCallback(async (filter: GetHelpFilter) => {
    setIsLoading(true);
    const params = {
      start_at: filter.startDate,
      end_at: filter.endDate,
    };
    const result = await fetchSystemGetHelpActivity(params);
    setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData(defaultFilter);
    lastFetchedDateRange.current = {
      startDate: defaultFilter.startDate,
      endDate: defaultFilter.endDate,
    };
  }, []);

  const handleApplyFilter = (filter: GetHelpFilter): void => {
    const validationError = getDateValidationError(filter, t);
    if (validationError) {
      // Don't apply the filter if there's a validation error
      return;
    }

    // Check if date range changed
    const dateChanged =
      filter.startDate !== lastFetchedDateRange.current.startDate ||
      filter.endDate !== lastFetchedDateRange.current.endDate;
    setAppliedFilter(filter);
    if (dateChanged) {
      fetchData(filter);
      lastFetchedDateRange.current = {
        startDate: filter.startDate,
        endDate: filter.endDate,
      };
    }
    // else: no fetch, just update appliedFilter (in-memory filtering)
  };

  // In-memory filtering for course/user
  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = [...data];
    if (appliedFilter.course && 'title' in appliedFilter.course) {
      filtered = filtered.filter(
        (item) => item.courseTitle === appliedFilter.course?.title,
      );
    }
    if (appliedFilter.user && 'name' in appliedFilter.user) {
      filtered = filtered.filter(
        (item) => item.name === appliedFilter.user?.name,
      );
    }
    return filtered;
  }, [data, appliedFilter]);

  const courseOptions = useMemo(() => {
    if (!data) return [];
    const titles = data.map((item) => item.courseTitle).filter(Boolean);
    // Remove duplicates
    const uniqueTitles = Array.from(new Set(titles));
    return uniqueTitles.map((title) => ({ title }));
  }, [data]);

  const userOptions = useMemo(() => {
    if (!data) return [];
    const names = data.map((item) => item.name).filter(Boolean);
    // Remove duplicates
    const uniqueNames = Array.from(new Set(names));
    return uniqueNames.map((name) => ({ name }));
  }, [data]);

  return (
    <>
      <Typography className="m-6" variant="h6">
        {t(translations.header)}
      </Typography>
      <SystemGetHelpFilter
        courseOptions={courseOptions}
        getDateValidationError={getDateValidationError}
        onFilterChange={handleApplyFilter}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        userOptions={userOptions}
      />
      {isLoading || !data ? (
        <LoadingIndicator />
      ) : (
        <SystemGetHelpActivityTable getHelpData={filteredData} />
      )}
    </>
  );
};

export default SystemGetHelpActivityIndex;
