export type AllowlistRuleType = 'user' | 'instance' | 'email_domain';

export interface AllowlistRuleData {
  id: number;
  ruleType: AllowlistRuleType;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  instanceId: number | null;
  instanceName: string | null;
  emailDomain: string | null;
}

export interface AllowlistRuleFormData {
  ruleType: AllowlistRuleType;
  email?: string;
  instanceId?: number;
  emailDomain?: string;
}
