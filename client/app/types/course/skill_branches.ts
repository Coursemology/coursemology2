import { SkillData, SkillEntity } from './skills';

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
