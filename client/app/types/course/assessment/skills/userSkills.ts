export interface UserSkillListData {
  id: number;
  branchId?: number;
  title: string;
  percentage: number;
  grade: number;
  totalGrade: number;
}

export interface UserSkillBranchListData {
  id: number;
  title: string;
  userSkills?: UserSkillListData[];
}

export interface UserSkillMiniEntity {
  id: number;
  branchId?: number;
  title: string;
  percentage: number;
  grade: number;
  totalGrade: number;
}

export interface UserSkillBranchMiniEntity {
  id: number;
  title: string;
  userSkills?: UserSkillMiniEntity[];
}
