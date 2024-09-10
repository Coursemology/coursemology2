import { useState } from 'react';
import moment from 'moment';
import { HeartbeatDetail } from 'types/channels/liveMonitoring';

import { BrowserAuthorizationMethod } from 'course/assessment/components/monitoring/BrowserAuthorizationMethodOptionsFormFields/common';

import HeartbeatDetailCard from './HeartbeatDetailCard';
import HeartbeatsTimelineChart from './HeartbeatsTimelineChart';

interface HeartbeatsTimelineProps {
  in: HeartbeatDetail[];
  validates?: boolean;
  browserAuthorizationMethod?: BrowserAuthorizationMethod;
}

/**
 * Returns the number of milliseconds between the heartbeat at the given index
 * and the one before it.
 *
 * @param heartbeats The list of heartbeats, sorted in chronological order.
 */
const getHeartbeatDelta = (
  heartbeats: HeartbeatDetail[],
  index: number,
): number | undefined => {
  if (index === 0) return 0;

  const heartbeat = heartbeats[index];
  const previousHeartbeat = heartbeats[index - 1];
  if (!heartbeat || !previousHeartbeat) return undefined;

  return moment(heartbeats[index]?.generatedAt).diff(
    heartbeats[index - 1]?.generatedAt,
  );
};

const HeartbeatsTimeline = (props: HeartbeatsTimelineProps): JSX.Element => {
  const { in: heartbeats } = props;

  const [hoveredIndex, setHoveredIndex] = useState<number>(
    Math.max(0, heartbeats.length - 1),
  );

  return (
    <>
      <HeartbeatsTimelineChart
        hoveredIndex={hoveredIndex}
        in={heartbeats}
        onHover={setHoveredIndex}
      />

      {heartbeats[hoveredIndex] && (
        <HeartbeatDetailCard
          browserAuthorizationMethod={props.browserAuthorizationMethod}
          className="ring-2 ring-offset-0"
          delta={getHeartbeatDelta(heartbeats, hoveredIndex)}
          of={heartbeats[hoveredIndex]}
          validates={props.validates}
        />
      )}
    </>
  );
};

export default HeartbeatsTimeline;
