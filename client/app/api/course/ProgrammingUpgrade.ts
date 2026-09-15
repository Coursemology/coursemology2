import {
  ProgrammingUpgradeListData,
  ProgrammingUpgradeResponseData,
} from 'types/course/programmingUpgrade';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class ProgrammingUpgradeAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/programming_upgrade/questions`;
  }

  /**
   * Fetches a page of the course's programming questions, together with every language they may be
   * upgraded to.
   */
  fetchQuestions(
    pageNum: number,
    length: number,
  ): APIResponse<ProgrammingUpgradeListData> {
    return this.client.get(this.#urlPrefix, {
      params: { filter: { page_num: pageNum, length } },
    });
  }

  /**
   * Starts an upgrade for each question, to the language it is mapped to.
   *
   * @param upgrades question id => target language id
   */
  upgrade(
    upgrades: Record<number, number>,
  ): APIResponse<ProgrammingUpgradeResponseData> {
    return this.client.post(this.#urlPrefix, { upgrades });
  }

  /**
   * Moves a question back to the language its last upgrade started from.
   */
  revert(questionId: number): APIResponse<ProgrammingUpgradeResponseData> {
    return this.client.post(`${this.#urlPrefix}/${questionId}/revert`);
  }

  /**
   * Re-reads the upgrade state of the given questions. Used to poll rows that are in progress.
   */
  fetchUpgrades(
    questionIds: number[],
  ): APIResponse<ProgrammingUpgradeResponseData> {
    return this.client.get(`${this.#urlPrefix}/upgrades`, {
      params: { question_ids: questionIds },
    });
  }
}
