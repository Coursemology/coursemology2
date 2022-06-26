export interface TodoData {
  id: number;
  itemActableId: number;
  itemActableTitle: string;
  isPersonalTime: boolean;
  startTimeInfo: {
    isFixed: boolean;
    effectiveTime: string;
    referenceTime: string;
  };
  endTimeInfo: {
    isFixed: boolean;
    effectiveTime: string;
    referenceTime: string;
  };
  progress: 'not_started' | 'in_progress';
  itemActableSpecificId: number;

  // Only for assessments
  canAccess?: boolean;
  canAttempt?: boolean;
}
