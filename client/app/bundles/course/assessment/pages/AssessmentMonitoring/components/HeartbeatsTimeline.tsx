import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Color } from 'chart.js';
import moment from 'moment';
import palette from 'theme/palette';
import { HeartbeatDetail } from 'types/channels/liveMonitoring';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

import HeartbeatDetailCard from './HeartbeatDetailCard';

const VALID_HEARTBEAT_COLOR = palette.success.main;
const INVALID_HEARTBEAT_COLOR = palette.error.main;
const SELECTED_HEARTBEAT_BORDER_COLOR = 'rgb(59 130 246 / 0.5)';

interface HeartbeatsTimelineProps {
  in: HeartbeatDetail[];
  hasSecret?: boolean;
}

const HeartbeatsTimeline = (props: HeartbeatsTimelineProps): JSX.Element => {
  const { in: heartbeats } = props;

  const { t } = useTranslation();

  const [hoveredIndex, setHoveredIndex] = useState<number>(0);

  const heartbeatsChartData = useMemo(
    () =>
      heartbeats.map((heartbeat) => ({
        ...heartbeat,
        generatedAt: moment(heartbeat.generatedAt).valueOf(),
        stale: heartbeat.stale ? t(translations.stale) : t(translations.live),
      })),
    [heartbeats],
  );

  return (
    <>
      <div className="h-[10rem]">
        <Line
          data={{
            datasets: [
              {
                data: heartbeatsChartData,
                pointBackgroundColor: (context): Color => {
                  const heartbeat = context.raw as HeartbeatDetail;

                  return heartbeat.isValid
                    ? VALID_HEARTBEAT_COLOR
                    : INVALID_HEARTBEAT_COLOR;
                },
                pointRadius: 5,
                pointHoverRadius: 5,
                pointBorderWidth: 5,
                pointHoverBorderWidth: 5,
                pointBorderColor: (context): Color =>
                  context.dataIndex === hoveredIndex
                    ? SELECTED_HEARTBEAT_BORDER_COLOR
                    : 'transparent',
                fill: true,
              },
            ],
          }}
          options={{
            parsing: {
              yAxisKey: 'stale',
              xAxisKey: 'generatedAt',
            },
            onHover: (event, elements): void => {
              if (event.type !== 'mousemove' || !elements.length) return;

              const element = elements[0];
              setHoveredIndex(element.index);
            },
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'second',
                  stepSize: 10,
                  displayFormats: {
                    second: 'HH:mm:ss',
                  },
                },
              },
              y: {
                type: 'category',
                labels: [t(translations.live), t(translations.stale), ''],
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            maintainAspectRatio: false,
            animation: false,
          }}
        />
      </div>

      {hoveredIndex !== undefined && (
        <HeartbeatDetailCard
          className="ring-2 ring-offset-0"
          hasSecret={props.hasSecret}
          of={heartbeats[hoveredIndex]}
        />
      )}
    </>
  );
};

export default HeartbeatsTimeline;
