import { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { PinchOutlined } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Color,
  PointStyle,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import palette from 'theme/palette';
import { HeartbeatDetail } from 'types/channels/liveMonitoring';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import translations from '../../../translations';
import { select } from '../selectors';
import { ChartPoint, getPresenceBuckets } from '../utils';

const VALID_HEARTBEAT_COLOR = palette.success.main;
const INVALID_HEARTBEAT_COLOR = palette.error.main;
const VALID_STALE_HEARTBEAT_COLOR = 'rgba(69, 184, 128, 0.3)';
const INVALID_STALE_HEARTBEAT_COLOR = 'rgba(255, 82, 99, 0.3)';
const SELECTED_HEARTBEAT_BORDER_COLOR = 'rgba(59, 130, 246, 0.5)';
const ALIVE_PERIOD_COLOR = 'rgba(69, 184, 128, 0.2)';
const LATE_PERIOD_COLOR = palette.warning.main;
const MISSING_PERIOD_COLOR = palette.error.main;

ChartJS.register(zoomPlugin);

interface HeartbeatsTimelineChartProps {
  in: HeartbeatDetail[];
  onHover?: (index: number) => void;
  hoveredIndex?: number;
}

const HeartbeatsTimelineChart = (
  props: HeartbeatsTimelineChartProps,
): JSX.Element => {
  const { in: heartbeats } = props;

  const { t } = useTranslation();

  const { maxIntervalMs, offsetMs } = useAppSelector(select('monitor'));

  const heartbeatsChartPoints = useMemo(
    () =>
      heartbeats.map((heartbeat) => ({
        timestamp: moment(heartbeat.generatedAt).valueOf(),
        liveness: 1,
      })),
    [heartbeats],
  );

  const [alives, lates, missings] = useMemo(
    () =>
      getPresenceBuckets(
        heartbeatsChartPoints.filter((_, index) => !heartbeats[index].stale),
        maxIntervalMs,
        offsetMs,
      ),
    [heartbeats, maxIntervalMs, offsetMs],
  );

  const data: ChartData<'line', ChartPoint[]> = {
    datasets: [
      {
        data: heartbeatsChartPoints,
        pointBorderColor: (context): Color => {
          if (context.dataIndex === props.hoveredIndex)
            return SELECTED_HEARTBEAT_BORDER_COLOR;

          const heartbeat = heartbeats[context.dataIndex];
          if (!heartbeat) return 'transparent';

          if (heartbeat.isValid && heartbeat.stale)
            return VALID_STALE_HEARTBEAT_COLOR;

          if (!heartbeat.isValid && heartbeat.stale)
            return INVALID_STALE_HEARTBEAT_COLOR;

          if (heartbeat.isValid && !heartbeat.stale)
            return VALID_HEARTBEAT_COLOR;

          return INVALID_HEARTBEAT_COLOR;
        },
        pointRadius: 5,
        pointHoverRadius: 5,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        pointStyle: (context): PointStyle => {
          const heartbeat = heartbeats[context.dataIndex];
          return heartbeat?.isValid ? 'circle' : 'crossRot';
        },
      },
      {
        data: alives,
        fill: true,
        backgroundColor: ALIVE_PERIOD_COLOR,
        pointRadius: 0,
        pointHoverRadius: 0,
        hoverBackgroundColor: VALID_HEARTBEAT_COLOR,
      },
      {
        data: lates,
        fill: true,
        backgroundColor: LATE_PERIOD_COLOR,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        data: missings,
        fill: true,
        backgroundColor: MISSING_PERIOD_COLOR,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  /**
   * `options` is memoized to prevent the zoom and pan states from resetting on every render.
   * Generally, there's no reason why `options` will need to dynamically change.
   * @see https://github.com/chartjs/chartjs-plugin-zoom/discussions/589
   */
  const options: ChartOptions<'line'> = useMemo(
    () => ({
      parsing: {
        xAxisKey: 'timestamp',
        yAxisKey: 'liveness',
      },
      onHover: (event, elements): void => {
        if (event.type !== 'mousemove' || !elements.length) return;

        const element = elements[0];
        if (element.datasetIndex !== 0) return;

        props.onHover?.(element.index);
      },
      scales: {
        x: {
          type: 'time',
          time: {
            minUnit: 'second',
            stepSize: 10,
            displayFormats: { second: 'HH:mm:ss' },
          },
          ticks: { major: { enabled: true } },
        },
        y: {
          type: 'linear',
          min: 0,
          max: 1.2,
          title: { display: true, text: t(translations.liveness) },
          ticks: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { displayColors: false, callbacks: { label: () => '' } },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
            scaleMode: 'x',
          },
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'x',
            scaleMode: 'x',
          },
        },
      },
      animation: false,
      maintainAspectRatio: false,
      responsive: true,
    }),
    [],
  );

  const ref = useRef<ChartJS<'line', ChartPoint[]>>(null);

  return (
    <div className="flex flex-col space-y-2 h-full overflow-hidden">
      <div className="w-full min-h-[15rem] h-full relative">
        <Line ref={ref} data={data} options={options} />
      </div>

      <div className="flex justify-between">
        <div className="flex space-x-2 items-center text-neutral-400">
          <PinchOutlined fontSize="small" />

          <Typography className="mt-0.5" color="inherit" variant="caption">
            {t(translations.zoomPanHint)}
          </Typography>
        </div>

        <Button onClick={(): void => ref.current?.resetZoom()} size="small">
          {t(translations.resetZoom)}
        </Button>
      </div>
    </div>
  );
};

export default HeartbeatsTimelineChart;
