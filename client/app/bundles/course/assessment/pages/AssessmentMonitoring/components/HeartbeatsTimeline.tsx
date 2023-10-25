import { useState } from 'react';
import moment from 'moment';
import { HeartbeatDetail } from 'types/channels/liveMonitoring';

import HeartbeatDetailCard from './HeartbeatDetailCard';
import HeartbeatsTimelineChart from './HeartbeatsTimelineChart';

interface HeartbeatsTimelineProps {
  in: HeartbeatDetail[];
  hasSecret?: boolean;
}

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
          hasSecret={props.hasSecret}
          of={heartbeats[hoveredIndex]}
        />
      )}
    </>
  );
};

export default HeartbeatsTimeline;
