import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import {
  ActivityGranularity,
  ActivityStatisticsData,
} from 'types/system/activities';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import SystemActivityChart from '../components/misc/SystemActivityChart';
import SystemActivityFilter from '../components/misc/SystemActivityFilter';
import SystemActivityTable, {
  OVERALL_ROW_KEY,
} from '../components/tables/SystemActivityTable';
import { fetchActivityStatistics } from '../operations';
import translations from '../translations/activityStatistics';

const parseYear = (value: string | null): number | null => {
  const parsed = Number(value);
  return value && Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const SystemActivityIndex: FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = useAppSelector((state) => state.global.user.user.id);
  // `data` is kept while a refetch is in flight so the series title above the chart stays put.
  const [data, setData] = useState<ActivityStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // The view lives in the URL so that an admin can share it. `year` only applies to the monthly
  // view; the yearly view always covers every year the server returns.
  const currentYear = new Date().getFullYear();
  const granularity: ActivityGranularity =
    searchParams.get('granularity') === 'year' ? 'year' : 'month';
  const year = Math.min(
    parseYear(searchParams.get('year')) ?? currentYear,
    currentYear,
  );
  const fetchYear = granularity === 'month' ? year : null;
  const selectedKey = searchParams.get('row') ?? OVERALL_ROW_KEY;

  const updateSearchParams = (changes: Record<string, string | null>): void =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        Object.entries(changes).forEach(([key, value]) =>
          value === null ? next.delete(key) : next.set(key, value),
        );
        return next;
      },
      { replace: true },
    );

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setFailed(false);
    fetchActivityStatistics({
      granularity,
      ...(fetchYear !== null && { year: fetchYear }),
      viewer_id: userId,
    })
      .then((result) => {
        if (ignore) return;
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        if (ignore) return;
        setFailed(true);
        setLoading(false);
        toast.error(t(translations.fetchFailure));
      });
    return () => {
      ignore = true;
    };
  }, [granularity, fetchYear, userId]);

  // Instances are the same in every response, so a stale response still names the selection.
  const selectedInstance = data?.instances.find(
    (instance) => instance.id.toString() === selectedKey,
  );
  const seriesName = selectedInstance?.name ?? t(translations.overall);

  // Nothing but the spinner until the first response, so the headings and controls do not appear
  // ahead of the data they describe. Later refetches only replace the chart and table.
  if (!data)
    return failed ? (
      <Note message={t(translations.fetchFailure)} />
    ) : (
      <LoadingIndicator />
    );

  const renderContent = (): JSX.Element => {
    if (failed) return <Note message={t(translations.fetchFailure)} />;
    if (loading) return <LoadingIndicator />;

    const bucketLabels = data.buckets.map((bucket) =>
      granularity === 'month'
        ? moment(bucket, 'YYYY-MM').format('MMM')
        : bucket,
    );
    const period =
      granularity === 'month'
        ? `${year}`
        : `${data.buckets[0]}–${data.buckets[data.buckets.length - 1]}`;
    // The first bucket after the last complete one, if it has started.
    const inProgressIndex = data.buckets.findIndex(
      (bucket, index) =>
        data.overall[index] !== null &&
        (data.lastCompleteBucket === null || bucket > data.lastCompleteBucket),
    );
    const previousCounts = selectedInstance
      ? selectedInstance.previousCounts
      : data.previousOverall;

    return (
      <>
        <SystemActivityChart
          bucketLabels={bucketLabels}
          comparison={
            previousCounts
              ? { label: `${year - 1}`, counts: previousCounts }
              : undefined
          }
          granularity={granularity}
          inProgressIndex={inProgressIndex}
          name={seriesName}
          series={{
            label: granularity === 'month' ? `${year}` : seriesName,
            counts: selectedInstance?.counts ?? data.overall,
          }}
        />
        <SystemActivityTable
          bucketLabels={bucketLabels}
          csvFileName={t(translations.csvFileName, { period })}
          granularity={granularity}
          inProgressIndex={inProgressIndex}
          instances={data.instances}
          onSelect={(rowKey): void =>
            updateSearchParams({
              row: rowKey === OVERALL_ROW_KEY ? null : rowKey,
            })
          }
          overall={data.overall}
          selectedKey={selectedInstance?.id.toString() ?? OVERALL_ROW_KEY}
        />
      </>
    );
  };

  return (
    <>
      <Typography className="m-6" variant="h6">
        {t(translations.header)}
      </Typography>
      <div className="mx-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Typography variant="h6">{seriesName}</Typography>
        <SystemActivityFilter
          granularity={granularity}
          onGranularityChange={(value): void =>
            updateSearchParams({ granularity: value })
          }
          yearStepper={
            granularity === 'month'
              ? {
                  year,
                  canGoPrevious: year > data.firstYear,
                  canGoNext: year < currentYear,
                  onStep: (direction): void =>
                    updateSearchParams({ year: (year + direction).toString() }),
                }
              : undefined
          }
        />
      </div>
      {renderContent()}
    </>
  );
};

export default SystemActivityIndex;
