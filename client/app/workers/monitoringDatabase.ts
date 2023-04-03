import { DBSchema, deleteDB, IDBPDatabase, openDB } from 'idb';
import { HeartbeatPostData } from 'types/channels/heartbeat';

const MONITORING_DB_NAME = 'monitoring' as const;
const MONITORING_DB_VERSION = 1 as const;
const TIMESTAMP_KEY = 'timestamp' as const;

interface MonitoringDB extends DBSchema {
  heartbeats: { key: number; value: HeartbeatPostData };
  common: { key: 'lastSuccessfulPulse'; value: number };
}

export interface MonitoringDBActions {
  updateLastSuccessfulPulse: (timestamp: number) => Promise<void>;
  cacheHeartbeat: (heartbeat: HeartbeatPostData) => Promise<void>;
  removeHeartbeat: (timestamp: number) => Promise<void>;
  getHeartbeats: () => Promise<HeartbeatPostData[]>;
  removeHeartbeats: (from: number, to: number) => Promise<void>;
  destroy: () => Promise<void>;
}

const connect = (db: IDBPDatabase<MonitoringDB>): MonitoringDBActions => ({
  updateLastSuccessfulPulse: async (timestamp): Promise<void> => {
    await db.put('common', timestamp, 'lastSuccessfulPulse');
  },

  cacheHeartbeat: async (heartbeat): Promise<void> => {
    await db.put('heartbeats', heartbeat);
  },

  removeHeartbeat: (timestamp) => db.delete('heartbeats', timestamp),

  getHeartbeats: async (): Promise<HeartbeatPostData[]> => {
    const lastSuccessfulPulse = await db.get('common', 'lastSuccessfulPulse');
    if (!lastSuccessfulPulse) return [];

    return db.getAll(
      'heartbeats',
      IDBKeyRange.lowerBound(lastSuccessfulPulse, true),
    );
  },

  removeHeartbeats: async (from: number, to: number): Promise<void> => {
    const transaction = db.transaction('heartbeats', 'readwrite');
    const heartbeats = transaction.objectStore('heartbeats');
    const keys = await heartbeats.getAllKeys(IDBKeyRange.bound(from, to));
    await Promise.all(keys.map((key) => heartbeats.delete(key)));
    await transaction.done;
  },

  destroy: (): Promise<void> => {
    db.close();
    return deleteDB(MONITORING_DB_NAME);
  },
});

const isIndexedDBSupported = (): boolean => 'indexedDB' in globalThis;

const upgrade = (db: IDBPDatabase<MonitoringDB>): void => {
  db.createObjectStore('heartbeats', { keyPath: TIMESTAMP_KEY });
  db.createObjectStore('common');
};

/**
 * Sets up a connection to and upgrades the schema of the monitoring database.
 * Storage is powered by IndexedDB.
 *
 * @returns `null` if IndexedDB is not supported by the browser.
 */
const setUpDatabase = async (): Promise<MonitoringDBActions | null> => {
  if (!isIndexedDBSupported()) return null;

  const db = await openDB<MonitoringDB>(
    MONITORING_DB_NAME,
    MONITORING_DB_VERSION,
    { upgrade },
  );

  return connect(db);
};

export default setUpDatabase;
