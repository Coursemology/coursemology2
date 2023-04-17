import { useEffect, useState } from 'react';
import moment from 'moment';
import { Snapshot } from 'types/channels/liveMonitoring';

import { useAppSelector } from 'lib/hooks/store';

import { select } from '../selectors';

export type Presence = 'alive' | 'late' | 'missing';

interface Callbacks {
  onMissing: (timestamp: number) => void;
  onAlive: (timestamp: number) => void;
}

const getPresenceFromNow = (
  time: string,
  maxIntervalMs: number,
  offsetMs: number,
): Presence => {
  if (!time) throw new Error(`Encountered time with value: ${time}`);

  const differenceMs = moment().diff(moment(time), 'milliseconds');

  if (differenceMs <= maxIntervalMs) return 'alive';
  if (differenceMs <= maxIntervalMs + offsetMs) return 'late';

  return 'missing';
};

const usePresence = (snapshot: Snapshot, callbacks: Callbacks): Presence => {
  const { maxIntervalMs, offsetMs } = useAppSelector(select('monitor'));

  const [presence, setPresence] = useState<Presence>(
    getPresenceFromNow(snapshot.lastHeartbeatAt, maxIntervalMs, offsetMs),
  );

  useEffect(() => {
    const currentPresence = snapshot.isValid
      ? getPresenceFromNow(snapshot.lastHeartbeatAt, maxIntervalMs, offsetMs)
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
