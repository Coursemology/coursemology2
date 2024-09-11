export interface LevelsInfo {
  levelId: number;
  experiencePointsThreshold: number;
}

export interface LevelsData {
  levels: LevelsInfo[];
  canManage: boolean;
}

export interface LevelsState extends LevelsData {}
