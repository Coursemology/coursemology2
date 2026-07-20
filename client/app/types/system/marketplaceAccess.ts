import { AllowlistRuleType } from 'types/system/marketplaceAllowlist';

/**
 * One rule granting a user access. A user may be granted by several rules at once — the audit list
 * shows all of them, because the admin uses that column to decide which rules are safe to delete.
 */
export interface AllowedByRule {
  id: number;
  ruleType: AllowlistRuleType;
  labelValue: string | null;
}

export interface MarketplaceAccessUser {
  id: number;
  name: string;
  email: string;
  courseCount: number;
  instanceRole: 'instructor' | 'administrator' | null;
  allowedByRules: AllowedByRule[];
  /** System admins bypass every gate, so they are listed and labelled regardless of the rules. */
  systemAdmin: boolean;
  blocked: boolean;
  blockId: number | null;
}

export interface MarketplaceAccessData {
  users: MarketplaceAccessUser[];
  summary: {
    totalWithAccess: number;
    totalBlocked: number;
    openToEveryone: boolean;
  };
}

export interface MarketplaceRulePreviewUser {
  id: number;
  name: string;
  email: string;
  courseCount: number;
  instanceRole: 'instructor' | 'administrator' | null;
  alreadyHasAccess: boolean;
  blocked: boolean;
}

export interface AllowlistRulePreviewData {
  matchedCount: number;
  /** Matched users who are neither already cleared by another rule nor blocked. */
  newCount: number;
  openToEveryone: boolean;
  users: MarketplaceRulePreviewUser[];
}
