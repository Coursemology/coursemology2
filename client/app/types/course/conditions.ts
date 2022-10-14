export interface ConditionListData {
  id: number;
  description?: string;
}

export interface ConditionData extends ConditionListData {
  type: 'Achievement' | 'Assessment' | 'Level' | 'Survey' | 'Video';
  url?: string;
}

export interface ConditionAbility {
  type: ConditionData['type'];
  url: string;
}

export type EnabledConditions = ConditionAbility[];

export interface ConditionsData {
  conditions: ConditionData[];
  enabledConditions: EnabledConditions;
}

export interface AchievementConditionData extends ConditionData {
  achievementId?: number;
}

export interface AssessmentConditionData extends ConditionData {
  assessmentId?: number;
  minimumGradePercentage?: number | null;
}

export interface LevelConditionData extends ConditionData {
  minimumLevel?: number;
}

export interface SurveyConditionData extends ConditionData {
  surveyId?: number;
}

export type AvailableAssessments = Record<string, string>;

export type AvailableSurveys = Record<string, string>;

export type AvailableAchievements = Record<
  string,
  {
    title: string;
    description: string;
    badge: string;
  }
>;

export interface ConditionPostData {
  condition_achievement?: {
    achievement_id: AchievementConditionData['achievementId'];
  };
  condition_assessment?: {
    assessment_id: AssessmentConditionData['assessmentId'];
    minimum_grade_percentage: AssessmentConditionData['minimumGradePercentage'];
  };
  condition_level?: {
    minimum_level: LevelConditionData['minimumLevel'];
  };
  condition_survey?: {
    survey_id: SurveyConditionData['surveyId'];
  };
}
