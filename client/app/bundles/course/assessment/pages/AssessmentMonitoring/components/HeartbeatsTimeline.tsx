import { useState } from 'react';
import moment from 'moment';
import { HeartbeatDetail } from 'types/channels/liveMonitoring';

import HeartbeatDetailCard from './HeartbeatDetailCard';
import HeartbeatsTimelineChart from './HeartbeatsTimelineChart';

interface HeartbeatsTimelineProps {
  in: HeartbeatDetail[];
  hasSecret?: boolean;
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
          className="ring-2 ring-offset-0"
          delta={getHeartbeatDelta(heartbeats, hoveredIndex)}
          hasSecret={props.hasSecret}
          of={heartbeats[hoveredIndex]}
        />
      )}
    </>
  );
};

export default HeartbeatsTimeline;
