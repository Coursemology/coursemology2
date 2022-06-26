import { Permissions } from 'types';

export interface SkillBranchOptions {
  value: number;
  label: string;
}

/**
 * Data types for skills data retrieved from backend through API call.
 */

export type SkillPermissions = Permissions<
  'canCreateSkill' | 'canCreateSkillBranch'
>;

export interface SkillListData {
  id: number;
  title: string;
  branchId?: number;
  description: string;
  permissions: {
    canUpdate: boolean;
    canDestroy: boolean;
  };
}

export interface SkillBranchListData {
  id: number;
  title: string;
  description: string;
  permissions: {
    canUpdate: boolean;
    canDestroy: boolean;
  };
  skills?: SkillListData[];
}

/**
 * Data types for achievement data used in frontend that are converted from
 * received backend data.
 */

export interface SkillMiniEntity {
  id: number;
  title: string;
  branchId?: number;
  description: string;
  permissions: {
    canUpdate: boolean;
    canDestroy: boolean;
  };
}

export interface SkillBranchMiniEntity {
  id: number;
  title: string;
  description: string;
  permissions: {
    canUpdate: boolean;
    canDestroy: boolean;
  };
  skills?: SkillMiniEntity[];
}

/**
 * Data types for skills form data.
 */

export interface SkillFormData {
  title: string;
  description: string;
  skillBranchId?: number | null;
}

/**
 * Data types for skills table data.
 */

export type SkillTableData = SkillListData;
export type SkillBranchTableData = SkillBranchListData;
