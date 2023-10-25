import { memo } from 'react';
import equal from 'fast-deep-equal';

import Session from './Session';

interface SessionsGridProps {
  for?: number[];
  getHeartbeats?: (sessionId: number, limit?: number) => void;
}

const SessionsGrid = (props: SessionsGridProps): JSX.Element => {
  const { for: userIds, getHeartbeats } = props;

  return (
    <section className="-m-1 flex h-fit w-full flex-wrap">
      {userIds?.map((userId) => (
        <Session key={userId} for={userId} getHeartbeats={getHeartbeats} />
      ))}
    </section>
  );
};

export default memo(SessionsGrid, equal);
