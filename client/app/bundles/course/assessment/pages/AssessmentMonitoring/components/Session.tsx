import { useAppSelector } from 'lib/hooks/store';

import { selectSnapshot } from '../selectors';

import ActiveSessionBlob from './ActiveSessionBlob';
import SessionBlob from './SessionBlob';

interface SessionProps {
  for: number;
  getHeartbeats?: (sessionId: number, limit?: number) => void;
}

const Session = (props: SessionProps): JSX.Element => {
  const { for: userId } = props;

  const snapshot = useAppSelector(selectSnapshot(userId));

  if (!snapshot.sessionId)
    return (
      <SessionBlob
        className="border border-solid border-neutral-200/50"
        of={snapshot}
      />
    );

  return (
    <ActiveSessionBlob
      for={userId}
      getHeartbeats={props.getHeartbeats}
      of={snapshot}
      warns={snapshot.misses > 0}
    />
  );
};

export default Session;
