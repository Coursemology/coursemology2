export interface ConditionListData {
  id: number;
  title: string;
}

export interface ConditionData extends ConditionListData {
  type: 'Achievement' | 'Assessment' | 'Level' | 'Survey' | 'Video';
  editUrl: string;
  deleteUrl: string;
}

export interface Conditions {
  name:
    | 'Achievement Condition'
    | 'Assessment Condition'
    | 'Level Condition'
    | 'Survey Condition'
    | 'Video Condition';
  url: string;
}

export enum ConditionEnum {
  Achievement = 'Achievement',
  Assessment = 'Assessment',
  Level = 'Level',
  Survey = 'Survey',
  Video = 'Video',
}
