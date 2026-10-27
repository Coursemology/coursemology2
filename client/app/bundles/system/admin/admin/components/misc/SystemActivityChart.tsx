import { FC, useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import { ChartData, ChartOptions, Plugin, ScriptableContext } from 'chart.js';
import { BLUE_CHART_BACKGROUND, BLUE_CHART_BORDER, white } from 'theme/colors';
import { ActivityGranularity } from 'types/system/activities';

import LineChart from 'lib/components/core/charts/LineChart';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations/activityStatistics';

interface ChartSeries {
  /** Shown in the tooltip and legend, e.g. the year. */
  label: string;
  counts: (number | null)[];
}

interface SystemActivityChartProps {
  /** The charted row; used for the accessible label, not shown as a heading. */
  name: string;
  granularity: ActivityGranularity;
  bucketLabels: string[];
  series: ChartSeries;
  /** Drawn in red behind `series`, e.g. the same months a year earlier. */
  comparison?: ChartSeries;
  /** The bucket still in progress, or -1. Drawn with a dashed segment and a hollow point. */
  inProgressIndex: number;
}

const IN_PROGRESS_DASH = [6, 4];

// RED_CHART_BORDER and RED_CHART_BACKGROUND (theme/colors), toned down so that the comparison
// stays behind the main series.
const COMPARISON_BORDER = 'rgba(255, 99, 132, 0.8)';
const COMPARISON_BACKGROUND = 'rgba(255, 99, 132, 0.08)';

const Stat: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <Typography color="text.secondary" variant="caption">
      {label}
    </Typography>
    <Typography variant="h6">{value}</Typography>
  </div>
);

const LegendItem: FC<{ color: string; label: string }> = (props) => (
  <span className="flex items-center gap-2">
    <span
      aria-hidden="true"
      className="inline-block w-6 border-t-2 border-solid"
      style={{ borderColor: props.color }}
    />
    <Typography variant="caption">{props.label}</Typography>
  </span>
);

const SystemActivityChart: FC<SystemActivityChartProps> = (props) => {
  const {
    name,
    granularity,
    bucketLabels,
    series,
    comparison,
    inProgressIndex,
  } = props;
  const { t } = useTranslation();

  // Counts are unique students per bucket, so they are averaged rather than summed: a student
  // active in several buckets would be counted once for each.
  const elapsed = series.counts.filter(
    (count): count is number => count !== null,
  );
  const average = elapsed.length
    ? Math.round(
        elapsed.reduce((sum, count) => sum + count, 0) / elapsed.length,
      )
    : 0;
  const peak = Math.max(0, ...elapsed);
  const peakBucket = bucketLabels[series.counts.indexOf(peak)];

  // The plot area stops short of the canvas's right edge (Chart.js leaves room for the last x
  // label), so the legend takes the same inset to end where the plotted line ends.
  const [legendInset, setLegendInset] = useState(0);
  const plugins = useMemo<Plugin<'line'>[]>(
    () => [
      {
        id: 'activityLegendInset',
        afterLayout: (chart): void =>
          setLegendInset(Math.round(chart.width - chart.chartArea.right)),
      },
    ],
    [],
  );

  const isInProgress = (context: ScriptableContext<'line'>): boolean =>
    context.dataIndex === inProgressIndex;

  const data: ChartData<'line'> = {
    labels: bucketLabels,
    datasets: [
      {
        label: series.label,
        data: series.counts,
        borderColor: BLUE_CHART_BORDER,
        backgroundColor: BLUE_CHART_BACKGROUND,
        fill: true,
        // A lower order is drawn on top, so the comparison sits behind.
        order: 0,
        pointBackgroundColor: (context) =>
          isInProgress(context) ? white : BLUE_CHART_BORDER,
        pointRadius: (context) => (isInProgress(context) ? 5 : 3),
        segment: {
          borderDash: (context) =>
            context.p1DataIndex === inProgressIndex
              ? IN_PROGRESS_DASH
              : undefined,
        },
      },
      ...(comparison
        ? [
            {
              label: comparison.label,
              data: comparison.counts,
              borderColor: COMPARISON_BORDER,
              backgroundColor: COMPARISON_BACKGROUND,
              borderWidth: 2,
              pointRadius: 2,
              fill: true,
              order: 1,
            },
          ]
        : []),
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        itemSort: (a, b) => a.datasetIndex - b.datasetIndex,
        callbacks: {
          title: ([item]) => {
            if (!item) return '';
            const label = bucketLabels[item.dataIndex];
            return item.dataIndex === inProgressIndex
              ? t(translations.currentLabel, { label })
              : label;
          },
          // Solid boxes in each line's colour; the default uses the faint area fill.
          labelColor: (item) => {
            const color = item.dataset.borderColor as string;
            return { borderColor: color, backgroundColor: color };
          },
          label: (item) => {
            const count = Number(item.raw);
            return granularity === 'month'
              ? `${item.dataset.label}: ${count.toLocaleString()}`
              : t(translations.studentCount, { count });
          },
        },
      },
    },
    scales: {
      // Matches the table header. Chart.js has no hover events on axis labels, so the
      // "(current)" note lives in the point tooltip instead.
      x: {
        ticks: {
          callback: (_, index) =>
            index === inProgressIndex
              ? `${bucketLabels[index]}*`
              : bucketLabels[index],
        },
      },
      y: {
        min: 0,
        // About half Chart.js's default density at this height; it still picks round steps.
        ticks: { maxTicksLimit: 6 },
        title: { display: true, text: t(translations.activeStudents) },
      },
    },
  };

  const summary = bucketLabels
    .map((label, index) => `${label} ${series.counts[index] ?? '—'}`)
    .join(', ');

  return (
    <section className="mx-6 my-4 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-wrap gap-10">
          <Stat
            label={t(
              granularity === 'month'
                ? translations.averagePerMonth
                : translations.averagePerYear,
            )}
            value={average.toLocaleString()}
          />
          <Stat
            label={t(translations.peak)}
            value={
              peak > 0
                ? t(translations.peakValue, {
                    count: peak.toLocaleString(),
                    bucket: peakBucket,
                  })
                : '—'
            }
          />
        </div>

        {comparison && (
          <div
            className="flex flex-col gap-1"
            style={{ marginRight: legendInset }}
          >
            <LegendItem color={BLUE_CHART_BORDER} label={series.label} />
            <LegendItem color={COMPARISON_BORDER} label={comparison.label} />
          </div>
        )}
      </div>

      <div
        aria-label={t(translations.chartSummary, { name, values: summary })}
        className="h-80"
        role="img"
      >
        <LineChart data={data} options={options} plugins={plugins} />
      </div>
    </section>
  );
};

export default SystemActivityChart;
