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

export interface SkillEntity {
  id: number;
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

export interface SkillBranchEntity {
  id: number;
  title: string;
  description?: string;
  canUpdate?: boolean;
  canDestroy?: boolean;
  skills?: SkillEntity[];
}

export interface UserSkillBranchEntity extends SkillBranchEntity {
  userSkills?: UserSkillEntity[];
}
