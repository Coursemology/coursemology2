export interface BranchOptions {
  value: number;
  label: string;
}

/**
 * Data types for skills data retrieved from backend through API call.
 */

export interface SkillSettings {
  canCreateSkill: boolean;
  canCreateSkillBranch: boolean;
  headerTitle: string;
  headerDescription: string;
}

export interface SkillListData extends SkillSettings {
  skillBranches: SkillBranchData[];
}

export interface SkillData {
  id: number;
  branchId?: number;
  title: string;
  description?: string;
  canUpdate?: boolean;
  canDestroy?: boolean;
}

export interface UserSkillData extends SkillData {
  percentage: number;
  grade: number;
  totalGrade: number;
}

export interface SkillBranchData {
  id: number;
  title: string;
  description?: string;
  canUpdate?: boolean;
  canDestroy?: boolean;
  skills?: SkillData[];
}

export interface UserSkillBranchData extends SkillBranchData {
  userSkills?: UserSkillData[];
}

/**
 * Data types for achievement data used in frontend that are converted from
 * received backend data.
 */

export interface SkillEntity {
  id: number;
  branchId?: number;
  title: string;
  description?: string;
  canUpdate?: boolean;
  canDestroy?: boolean;
}

export interface UserSkillEntity extends SkillEntity {
  percentage: number;
  grade: number;
  totalGrade: number;
}

export interface SkillBranchEntity {
  id: number;
  title: string;
  description?: string;
  canUpdate?: boolean;
  canDestroy?: boolean;
}

export interface UserSkillBranchEntity extends SkillBranchEntity {
  userSkills?: UserSkillEntity[];
}

/**
 * Data types for skills form data.
 */

export interface SkillBranchFormData {
  title: string;
  description: string;
}

export interface SkillFormData extends SkillBranchFormData {
  skill_branch_id?: number;
}

/**
 * Data types for skills response data.
 */

export interface SkillResponseData {
  id: number;
  canDestroy: boolean;
  canUpdate: boolean;
}
