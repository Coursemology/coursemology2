import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
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

const { startDate, endDate } = getDefaultDateRange();

const defaultFilter: GetHelpFilter = {
  course: null,
  user: null,
  startDate,
  endDate,
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

  const fetchData = useCallback(
    async (filter = appliedFilter) => {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (filter.startDate) params.start_date = filter.startDate;
      if (filter.endDate) params.end_date = filter.endDate;
      const result = await fetchSystemGetHelpActivity(params);
      setData(result);
      setIsLoading(false);
    },
    [appliedFilter],
  );

  useEffect(() => {
    fetchData();
    lastFetchedDateRange.current = {
      startDate: appliedFilter.startDate,
      endDate: appliedFilter.endDate,
    };
  }, []);

  const handleApplyFilter = (): void => {
    // Check if date range changed
    const dateChanged =
      selectedFilter.startDate !== lastFetchedDateRange.current.startDate ||
      selectedFilter.endDate !== lastFetchedDateRange.current.endDate;
    setAppliedFilter(selectedFilter);
    if (dateChanged) {
      fetchData(selectedFilter);
      lastFetchedDateRange.current = {
        startDate: selectedFilter.startDate,
        endDate: selectedFilter.endDate,
      };
    }
    // else: no fetch, just update appliedFilter (in-memory filtering)
  };

  const handleClearFilter = (): void => {
    setSelectedFilter(defaultFilter);
    setAppliedFilter(defaultFilter);
    fetchData(defaultFilter);
    lastFetchedDateRange.current = { startDate: '', endDate: '' };
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
    const courseMap = new Map<number, string>();
    data.forEach((item) => {
      if (item.courseId && item.courseTitle)
        courseMap.set(item.courseId, item.courseTitle);
    });
    return Array.from(courseMap, ([id, title]) => ({ id, title }));
  }, [data]);

  const userOptions = useMemo(() => {
    if (!data) return [];
    const userMap = new Map<number, string>();
    data.forEach((item) => {
      if (item.userId && item.name) userMap.set(item.userId, item.name);
    });
    return Array.from(userMap, ([id, name]) => ({ id, name }));
  }, [data]);

  return (
    <>
      <Typography className="m-6" variant="h6">
        {t(translations.header)}
      </Typography>
      <SystemGetHelpFilter
        courseOptions={courseOptions}
        userOptions={userOptions}
        handleApplyFilter={handleApplyFilter}
        handleClearFilter={handleClearFilter}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
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
