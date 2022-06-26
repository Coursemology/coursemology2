export interface InstanceUserRoleRequestData {
  id: number;
  instanceId: number;
  userId: number;
  role: string;
  organization: string;
  designation: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}
