export const STUDENT_INFO_COL_IDS = ['name', 'email', 'externalId'] as const;
export type StudentInfoColId = (typeof STUDENT_INFO_COL_IDS)[number];

export const GAMIFICATION_COL_IDS = ['level', 'totalXp'] as const;
export type GamificationColId = (typeof GAMIFICATION_COL_IDS)[number];

/** Synthetic category id for external assessments (mirrors backend
 *  Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID). */
export const EXTERNAL_CATEGORY_ID = -1;
