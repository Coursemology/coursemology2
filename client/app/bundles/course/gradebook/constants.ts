export const STUDENT_INFO_COL_IDS = ['name', 'email'] as const;
export type StudentInfoColId = (typeof STUDENT_INFO_COL_IDS)[number];

export const GAMIFICATION_COL_IDS = ['level', 'totalXp'] as const;
export type GamificationColId = (typeof GAMIFICATION_COL_IDS)[number];
