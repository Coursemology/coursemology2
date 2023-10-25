import { useEffect, useState } from 'react';
import { Snapshot } from 'types/channels/liveMonitoring';

import { useAppSelector } from 'lib/hooks/store';

import { select } from '../selectors';
import { getPresenceBetween, Presence } from '../utils';

interface Callbacks {
  onMissing: (timestamp: number) => void;
  onAlive: (timestamp: number) => void;
}

const usePresence = (snapshot: Snapshot, callbacks: Callbacks): Presence => {
  const { maxIntervalMs, offsetMs } = useAppSelector(select('monitor'));

  const [presence, setPresence] = useState<Presence>(
    getPresenceBetween(maxIntervalMs, offsetMs, snapshot.lastHeartbeatAt),
  );

  useEffect(() => {
    const currentPresence = snapshot.isValid
      ? getPresenceBetween(maxIntervalMs, offsetMs, snapshot.lastHeartbeatAt)
      : 'missing';

    let timeout: NodeJS.Timeout;

    if (currentPresence === 'alive') {
      timeout = setTimeout(() => setPresence('late'), maxIntervalMs);
      if (presence === 'missing') callbacks.onAlive(Date.now());
    }

    if (currentPresence === 'late')
      timeout = setTimeout(() => {
        callbacks.onMissing(Date.now());
        setPresence('missing');
      }, offsetMs);

    setPresence(currentPresence);

    return () => clearTimeout(timeout);
  }, [snapshot.lastHeartbeatAt, presence]);

  return presence;
};

export default usePresence;
