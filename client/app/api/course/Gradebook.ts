import {
  ExternalAssessmentNode,
  ExternalAssessmentUpdate,
  ExternalGradePayload,
  GradebookData,
  ImportCommitSummary,
  ImportPreviewRequest,
  ImportPreviewResult,
  UpdateWeightsPayload,
} from 'types/course/gradebook';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class GradebookAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/gradebook`;
  }

  index(): APIResponse<GradebookData> {
    return this.client.get(this.#urlPrefix);
  }

  updateWeights(
    payload: UpdateWeightsPayload,
  ): APIResponse<UpdateWeightsPayload> {
    return this.client.patch(`${this.#urlPrefix}/weights`, payload);
  }

  createExternal(payload: {
    title: string;
    maximumGrade: number;
    floorAtZero: boolean;
    capAtMaximum: boolean;
    weight?: number;
  }): APIResponse<ExternalAssessmentNode> {
    return this.client.post(`${this.#urlPrefix}/external_assessments`, payload);
  }

  // `id` is the positive external id (negate the negative serialized id before calling).
  updateExternal(
    id: number,
    payload: {
      title?: string;
      maximumGrade?: number;
      floorAtZero?: boolean;
      capAtMaximum?: boolean;
      weight?: number;
    },
  ): APIResponse<ExternalAssessmentUpdate> {
    return this.client.patch(
      `${this.#urlPrefix}/external_assessments/${id}`,
      payload,
    );
  }

  deleteExternal(id: number): APIResponse<void> {
    return this.client.delete(`${this.#urlPrefix}/external_assessments/${id}`);
  }

  setExternalGrade(
    id: number,
    payload: { studentId: number; grade: number | null },
  ): APIResponse<ExternalGradePayload> {
    return this.client.put(
      `${this.#urlPrefix}/external_assessments/${id}/grades`,
      payload,
    );
  }

  importPreview(
    payload: ImportPreviewRequest,
  ): APIResponse<ImportPreviewResult> {
    return this.client.post(
      `${this.#urlPrefix}/external_assessment_imports/preview`,
      payload,
    );
  }

  importCommit(
    payload: ImportPreviewRequest & { onConflict: 'keep' | 'replace' },
  ): APIResponse<ImportCommitSummary> {
    return this.client.post(
      `${this.#urlPrefix}/external_assessment_imports`,
      payload,
    );
  }
}
