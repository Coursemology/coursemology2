import { AxiosResponse } from 'axios';
import {
  AnnouncementData,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { CourseListData } from 'types/system/courses';
import { InstanceListData, InstancePermissions } from 'types/system/instances';
import {
  AllowlistRulePreviewData,
  MarketplaceAccessData,
} from 'types/system/marketplaceAccess';
import {
  AllowlistRuleData,
  AllowlistRuleFormData,
} from 'types/system/marketplaceAllowlist';
import { AdminStats, UserListData } from 'types/users';

import BaseSystemAPI from '../Base';

interface FilterParams {
  'filter[page_num]'?: number;
  'filter[length]'?: number;
  role?: string;
  active?: string;
  search?: string;
}

export interface DeploymentInfo {
  commit_hash: string;
}

export default class AdminAPI extends BaseSystemAPI {
  static get #urlPrefix(): string {
    return `/admin`;
  }

  /**
   * Fetches a list of system announcements.
   */
  indexAnnouncements(): Promise<
    AxiosResponse<{
      announcements: AnnouncementData[];
      permissions: AnnouncementPermissions;
    }>
  > {
    return this.client.get(`${AdminAPI.#urlPrefix}/announcements`);
  }

  /**
   * Creates a system announcement.
   */
  createAnnouncement(params: FormData): Promise<AxiosResponse> {
    return this.client.post(`${AdminAPI.#urlPrefix}/announcements`, params);
  }

  /**
   * Updates a system announcement.
   */
  updateAnnouncement(
    announcementId: number,
    params: FormData,
  ): Promise<AxiosResponse> {
    return this.client.patch(
      `${AdminAPI.#urlPrefix}/announcements/${announcementId}`,
      params,
    );
  }

  /**
   * Deletes a system announcement.
   */
  deleteAnnouncement(announcementId: number): Promise<AxiosResponse> {
    return this.client.delete(
      `${AdminAPI.#urlPrefix}/announcements/${announcementId}`,
    );
  }

  /**
   * Fetches a list of system users.
   */
  indexUsers(params?: FilterParams): Promise<
    AxiosResponse<{
      users: UserListData[];
      counts: AdminStats;
    }>
  > {
    return this.client.get(`${AdminAPI.#urlPrefix}/users/`, {
      params,
    });
  }

  /**
   * Updates a system user.
   */
  updateUser(userId: number, params: FormData): Promise<AxiosResponse> {
    return this.client.patch(`${AdminAPI.#urlPrefix}/users/${userId}`, params);
  }

  /**
   * Deletes a system user.
   */
  deleteUser(userId: number): Promise<AxiosResponse> {
    return this.client.delete(`${AdminAPI.#urlPrefix}/users/${userId}`);
  }

  /**
   * Fetches a list of instances.
   */
  indexInstances(): Promise<
    AxiosResponse<{
      instances: InstanceListData[];
      permissions: InstancePermissions;
      counts: number;
    }>
  > {
    return this.client.get(`${AdminAPI.#urlPrefix}/instances`);
  }

  /**
   * Creates an instance.
   */
  createInstance(params: FormData): Promise<AxiosResponse> {
    return this.client.post(`${AdminAPI.#urlPrefix}/instances`, params);
  }

  /**
   * Updates an instance.
   */
  updateInstance(instanceId: number, params: FormData): Promise<AxiosResponse> {
    return this.client.patch(
      `${AdminAPI.#urlPrefix}/instances/${instanceId}`,
      params,
    );
  }

  /**
   * Deletes an instance.
   */
  deleteInstance(instanceId: number): Promise<AxiosResponse> {
    return this.client.delete(`${AdminAPI.#urlPrefix}/instances/${instanceId}`);
  }

  /**
   * Fetches a list of courses.
   */
  indexCourses(params?: FilterParams): Promise<
    AxiosResponse<{
      courses: CourseListData[];
      totalCourses: number;
      activeCourses: number;
      coursesCount: number;
    }>
  > {
    return this.client.get(`${AdminAPI.#urlPrefix}/courses`, {
      params,
    });
  }

  /**
   * Deletes a course
   */
  deleteCourse(id: number): Promise<AxiosResponse> {
    return this.client.delete(`${AdminAPI.#urlPrefix}/courses/${id}`);
  }

  /**
   * Fetches Get Help data for the system
   */
  fetchSystemGetHelpActivity(params: {
    start_at: string;
    end_at: string;
  }): Promise<AxiosResponse> {
    return this.client.get(`${AdminAPI.#urlPrefix}/get_help`, {
      params,
    });
  }

  /**
   * Get deployment information
   */
  getDeploymentInfo(): Promise<AxiosResponse<DeploymentInfo>> {
    return this.client.get(`${AdminAPI.#urlPrefix}/deployment_info`);
  }

  /**
   * Fetches the marketplace allow-list rules.
   */
  indexMarketplaceAllowlistRules(): Promise<
    AxiosResponse<{ rules: AllowlistRuleData[]; everyoneRuleId: number | null }>
  > {
    return this.client.get(
      `${AdminAPI.#urlPrefix}/marketplace_allowlist_rules`,
    );
  }

  /**
   * Creates a marketplace allow-list rule.
   */
  createMarketplaceAllowlistRule(
    params: AllowlistRuleFormData,
  ): Promise<AxiosResponse<AllowlistRuleData>> {
    return this.client.post(
      `${AdminAPI.#urlPrefix}/marketplace_allowlist_rules`,
      {
        allowlist_rule: {
          rule_type: params.ruleType,
          instance_id: params.instanceId,
          email_domain: params.emailDomain,
          email: params.email,
        },
      },
    );
  }

  /**
   * Dry run for a prospective allow-list rule: reports who it would let in, without saving it.
   * Runs the same validations as create, so a duplicate rule is reported here as a 400.
   */
  previewMarketplaceAllowlistRule(
    params: AllowlistRuleFormData,
  ): Promise<AxiosResponse<AllowlistRulePreviewData>> {
    return this.client.post(
      `${AdminAPI.#urlPrefix}/marketplace_allowlist_rules/preview`,
      {
        allowlist_rule: {
          rule_type: params.ruleType,
          instance_id: params.instanceId,
          email_domain: params.emailDomain,
          email: params.email,
        },
      },
    );
  }

  /**
   * Opens the marketplace to everyone by creating the single `everyone` allow-list rule.
   * Returns the created rule; only its `id` is consumed (to later restrict).
   */
  openMarketplaceToEveryone(): Promise<AxiosResponse<{ id: number }>> {
    return this.client.post(
      `${AdminAPI.#urlPrefix}/marketplace_allowlist_rules`,
      { allowlist_rule: { rule_type: 'everyone' } },
    );
  }

  /**
   * Deletes a marketplace allow-list rule.
   */
  deleteMarketplaceAllowlistRule(id: number): Promise<AxiosResponse> {
    return this.client.delete(
      `${AdminAPI.#urlPrefix}/marketplace_allowlist_rules/${id}`,
    );
  }

  /**
   * Fetches the marketplace access audit list (everyone with effective access, blocked flagged).
   */
  indexMarketplaceAccess(): Promise<AxiosResponse<MarketplaceAccessData>> {
    return this.client.get(`${AdminAPI.#urlPrefix}/marketplace_access`);
  }

  /**
   * Blocks (disables) a user's marketplace access. Returns the created block's id.
   */
  blockMarketplaceUser(
    userId: number,
  ): Promise<AxiosResponse<{ id: number; userId: number }>> {
    return this.client.post(
      `${AdminAPI.#urlPrefix}/marketplace_access_blocks`,
      {
        user_id: userId,
      },
    );
  }

  /**
   * Removes a block, re-enabling the user's marketplace access.
   */
  unblockMarketplaceUser(blockId: number): Promise<AxiosResponse> {
    return this.client.delete(
      `${AdminAPI.#urlPrefix}/marketplace_access_blocks/${blockId}`,
    );
  }
}
