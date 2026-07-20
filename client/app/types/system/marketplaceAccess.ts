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
  /** Matched users held back by an individual block, which a rule does not lift. */
  blockedCount: number;
  openToEveryone: boolean;
  users: MarketplaceRulePreviewUser[];
}
