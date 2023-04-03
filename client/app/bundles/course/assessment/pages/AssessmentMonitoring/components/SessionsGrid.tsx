import { memo } from 'react';
import equal from 'fast-deep-equal';

import Session from './Session';

interface SessionsGridProps {
  for?: number[];
  onClickSession?: (sessionId: number) => void;
}

const SessionsGrid = (props: SessionsGridProps): JSX.Element => {
  const { for: userIds, onClickSession } = props;

  return (
    <section className="-m-1 flex h-fit w-full flex-wrap">
      {userIds?.map((userId) => (
        <Session key={userId} for={userId} onClick={onClickSession} />
      ))}
    </section>
  );
};

export default memo(SessionsGrid, equal);
