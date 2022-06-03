export interface SkillData {
  id: number;
  title: string;
  percentage: number;
  grade: number;
  totalGrade: number;
}

export interface SkillEntity {
  id: number;
  title: string;
  percentage: number;
  grade: number;
  totalGrade: number;
}

export interface SkillBranchData {
  id: number;
  title: string;
  description?: string;
  skills?: SkillData[];
}

export interface SkillBranchEntity {
  id: number;
  title: string;
  description?: string;
  skills?: SkillEntity[];
}
