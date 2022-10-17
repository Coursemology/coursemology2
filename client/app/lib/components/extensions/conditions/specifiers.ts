import {
  ConditionData,
  AchievementConditionData,
  AssessmentConditionData,
  SurveyConditionData,
  LevelConditionData,
  ConditionPostData,
} from 'types/course/conditions';
import AchievementCondition from './conditions/AchievementCondition';
import { AnyCondition } from './AnyCondition';
import AssessmentCondition from './conditions/AssessmentCondition';
import LevelCondition from './conditions/LevelCondition';
import SurveyCondition from './conditions/SurveyCondition';

/**
 * A construct that defines the necessary attributes for an unlock condition type.
 */
interface Specifier<AnyConditionData extends ConditionData> {
  component: AnyCondition;
  extractUniqueData: (condition: AnyConditionData) => number | void;
  adaptDataForPost: (data: Partial<AnyConditionData>) => ConditionPostData;
}

type Specifiers = Record<ConditionData['type'], Specifier<ConditionData>>;

const achievementSpecifier: Specifier<AchievementConditionData> = {
  component: AchievementCondition,
  extractUniqueData: (condition) => condition.achievementId,
  adaptDataForPost: (data) => ({
    condition_achievement: { achievement_id: data.achievementId },
  }),
};

const assessmentSpecifier: Specifier<AssessmentConditionData> = {
  component: AssessmentCondition,
  extractUniqueData: (condition) => condition.assessmentId,
  adaptDataForPost: (data) => ({
    condition_assessment: {
      assessment_id: data.assessmentId,
      minimum_grade_percentage: data.minimumGradePercentage,
    },
  }),
};

const levelSpecifier: Specifier<LevelConditionData> = {
  component: LevelCondition,
  extractUniqueData: (condition) => condition.minimumLevel,
  adaptDataForPost: (data) => ({
    condition_level: { minimum_level: data.minimumLevel },
  }),
};

const surveySpecifier: Specifier<SurveyConditionData> = {
  component: SurveyCondition,
  extractUniqueData: (condition) => condition.surveyId,
  adaptDataForPost: (data) => ({
    condition_survey: { survey_id: data.surveyId },
  }),
};

const SPECIFIERS: Specifiers = {
  Achievement: achievementSpecifier,
  Assessment: assessmentSpecifier,
  Level: levelSpecifier,
  Survey: surveySpecifier,
  Video: achievementSpecifier,
};

/**
 * Returns the `Specifier` for a given unlock condition type that contains
 * many condition-specific attributes, such as the `AnyCondition` component
 * and the POST request data adaptors.
 */
const specify = (type: ConditionData['type']): Specifier<ConditionData> =>
  SPECIFIERS[type];

export default specify;
