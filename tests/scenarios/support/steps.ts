import * as fs from 'fs';
import * as path from 'path';

import { expect, Page, test, TestInfo } from '@playwright/test';

import {
  AnswerLabels,
  checkInvariants,
  dbNow,
  describe,
  settledSnapshot,
  Snapshot,
} from './snapshot';
import { attemptsLeftShown } from './submission';

export interface Prediction {
  submission: string;
  answers: Record<string, string[]>;
  /** Attempts left the student's Check Answer button should show, when the student's page is open. */
  attemptsLeft?: number;
}

interface StepResult {
  id: string;
  action: string;
  predicted: Prediction;
  actualSubmission: string;
  actualAnswers: Record<string, string[]>;
  attemptsLeft: number | null | undefined;
  invariantFailures: string[];
  matches: boolean;
}

/**
 * Runs a scenario's steps: each action through the UI, then a settled database snapshot compared with
 * the step's prediction. Mismatches are soft failures, so a scenario always runs to the end and
 * reports every step.
 */
export class StepRecorder {
  private results: StepResult[] = [];
  private labels: AnswerLabels | undefined;
  readonly resultsFile: string;

  constructor(
    private testInfo: TestInfo,
    private scenario: string,
    private submissionId: () => number,
  ) {
    this.resultsFile = path.join('scenario-results', `${scenario}-results.md`);
  }

  private labelsFor(snapshot: Snapshot): AnswerLabels {
    if (!this.labels) {
      // The scenarios' assessments have a programming question then a text response question.
      const names = new Map<number, string>();
      for (const answer of snapshot.answers) {
        names.set(answer.question_id, answer.code !== null ? 'Q1' : 'Q2');
      }
      this.labels = new AnswerLabels(names);
    }
    return this.labels;
  }

  async step(
    id: string,
    action: string,
    run: () => Promise<void>,
    predicted: Prediction,
    pages: { student?: Page; screenshot?: Page } = {},
  ): Promise<Snapshot> {
    return test.step(`${id}: ${action}`, async () => {
      const since = dbNow();
      await run();

      const snapshot = await settledSnapshot(this.submissionId(), since);
      const labels = this.labelsFor(snapshot);
      const actualAnswers = describe(snapshot, labels);
      const invariantFailures = checkInvariants(snapshot, labels);

      let attemptsLeft: number | null | undefined;
      if (pages.student && predicted.attemptsLeft !== undefined) {
        // The page refreshes the count once it has the grading result.
        await expect
          .poll(() => attemptsLeftShown(pages.student!, 'Q1 add'), { timeout: 15_000 })
          .toBe(predicted.attemptsLeft)
          .catch(() => undefined);
        attemptsLeft = await attemptsLeftShown(pages.student, 'Q1 add');
      }

      const sorted = (answers: Record<string, string[]>): string =>
        JSON.stringify(Object.entries(answers).sort(([a], [b]) => a.localeCompare(b)));
      const matches =
        snapshot.submission.workflow_state === predicted.submission &&
        sorted(actualAnswers) === sorted(predicted.answers) &&
        (predicted.attemptsLeft === undefined || attemptsLeft === predicted.attemptsLeft);

      const result: StepResult = {
        id,
        action,
        predicted,
        actualSubmission: snapshot.submission.workflow_state,
        actualAnswers,
        attemptsLeft,
        invariantFailures,
        matches,
      };
      this.results.push(result);
      this.writeResults();

      // Written to the test's output folder as well as attached, so they're kept next to the trace.
      const snapshotPath = this.testInfo.outputPath(`${id}-snapshot.json`);
      fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
      await this.testInfo.attach(`${id} snapshot.json`, { path: snapshotPath, contentType: 'application/json' });
      const screenshotPage = pages.screenshot ?? pages.student;
      if (screenshotPage) {
        const screenshotPath = this.testInfo.outputPath(`${id}-page.png`);
        await screenshotPage.screenshot({ path: screenshotPath, fullPage: true });
        await this.testInfo.attach(`${id} page.png`, { path: screenshotPath, contentType: 'image/png' });
      }

      expect.soft(snapshot.submission.workflow_state, `${id} submission`).toBe(predicted.submission);
      expect.soft(actualAnswers, `${id} answers`).toEqual(predicted.answers);
      if (predicted.attemptsLeft !== undefined) {
        expect.soft(attemptsLeft, `${id} attempts left`).toBe(predicted.attemptsLeft);
      }
      return snapshot;
    });
  }

  private writeResults(): void {
    const lines = [`# Scenario ${this.scenario}: predicted and actual`, ''];
    for (const r of this.results) {
      lines.push(`## ${r.id}: ${r.action} — ${r.matches ? 'matches' : '**differs**'}`, '');
      lines.push(`- Submission: predicted \`${r.predicted.submission}\`, actual \`${r.actualSubmission}\``);
      if (r.predicted.attemptsLeft !== undefined) {
        lines.push(`- Attempts left: predicted ${r.predicted.attemptsLeft}, shown ${r.attemptsLeft}`);
      }
      for (const question of new Set([
        ...Object.keys(r.predicted.answers),
        ...Object.keys(r.actualAnswers),
      ])) {
        const predicted = r.predicted.answers[question] ?? [];
        const actual = r.actualAnswers[question] ?? [];
        lines.push(`- ${question} predicted: ${predicted.map((a) => `\`${a}\``).join(', ')}`);
        lines.push(`- ${question} actual: ${actual.map((a) => `\`${a}\``).join(', ')}`);
      }
      lines.push(
        `- Invariants: ${r.invariantFailures.length ? r.invariantFailures.join('; ') : 'all hold'}`,
        '',
      );
    }
    fs.mkdirSync(path.dirname(this.resultsFile), { recursive: true });
    fs.writeFileSync(this.resultsFile, lines.join('\n'));
  }
}
