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
  status: 'connecting' | 'connected' | 'disconnected';
  monitor: MonitoringMonitorData;
  selectedUserId?: number;
}
