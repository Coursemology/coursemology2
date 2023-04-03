import {
  MonitoringMonitorData,
  Snapshots,
} from 'types/channels/liveMonitoring';

export interface Activity {
  message: string;
  type: 'alive' | 'missing' | 'info';
  timestamp: number;
  userId?: number;
}

export interface MonitoringState {
  snapshots: Snapshots;
  history: Activity[];
  connected: boolean;
  monitor: MonitoringMonitorData;
  selectedUserId?: number;
}
