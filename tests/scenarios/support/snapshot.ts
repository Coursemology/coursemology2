import { execFileSync } from 'child_process';

import { expect } from '@playwright/test';

/**
 * Reads a submission's state straight from the development database, read-only, to check what the UI
 * did. Connection settings come from the standard `PG*` environment variables, defaulting to the
 * development database on localhost.
 */

export interface Run {
  id: number;
  createdAt: string;
  finished: boolean;
  /** 0 submitted, 1 completed, 2 errored; null once the job record is gone. */
  jobStatus: number | null;
  passed: number;
  total: number;
}

export interface AnswerRow {
  id: number;
  question_id: number;
  current_answer: boolean;
  workflow_state: string;
  grade: string | null;
  grader_id: number | null;
  graded_at: string | null;
  submitted_at: string | null;
  created_at: string;
  code: string | null;
  text: string | null;
  runs: Run[] | null;
}

export interface Snapshot {
  submission: {
    id: number;
    workflow_state: string;
    submitted_at: string | null;
    unsubmitted_at: string | null;
    published_at: string | null;
    points_awarded: number | null;
    draft_points_awarded: number | null;
  };
  answers: AnswerRow[];
  pendingJobsSinceMark: number;
}

const query = (submissionId: number, since: string): string => `
with s as (
  select s.id, s.workflow_state, s.submitted_at, s.unsubmitted_at, s.published_at,
         e.points_awarded, e.draft_points_awarded
  from course_assessment_submissions s
  left join course_experience_points_records e
    on e.actable_id = s.id and e.actable_type = 'Course::Assessment::Submission'
  where s.id = ${submissionId}
),
a as (
  select a.id, a.question_id, a.current_answer, a.workflow_state, a.grade, a.grader_id, a.graded_at,
         a.submitted_at, a.created_at,
         (select string_agg(f.content, '' order by f.id) from course_assessment_answer_programming_files f
           where a.actable_type = 'Course::Assessment::Answer::Programming' and f.answer_id = a.actable_id) as code,
         (select t.answer_text from course_assessment_answer_text_responses t
           where a.actable_type = 'Course::Assessment::Answer::TextResponse' and t.id = a.actable_id) as text,
         (select json_agg(json_build_object(
                   'id', g.id, 'createdAt', g.created_at, 'finished', g.actable_id is not null,
                   'jobStatus', j.status,
                   'passed', (select count(*) from course_assessment_answer_programming_test_results r
                               where r.auto_grading_id = g.actable_id and r.passed),
                   'total', (select count(*) from course_assessment_answer_programming_test_results r
                              where r.auto_grading_id = g.actable_id))
                 order by g.created_at, g.id)
            from course_assessment_answer_auto_gradings g left join jobs j on j.id = g.job_id
           where g.answer_id = a.id) as runs
  from course_assessment_answers a
  where a.submission_id = ${submissionId}
  order by a.created_at, a.id
)
select json_build_object(
  'submission', (select row_to_json(s) from s),
  'answers', coalesce((select json_agg(row_to_json(a)) from a), '[]'::json),
  'pendingJobsSinceMark', (select count(*) from jobs where status = 0 and created_at >= '${since}')
);`;

const read = (submissionId: number, since: string): Snapshot => {
  const output = execFileSync(
    'psql',
    ['-At', '-v', 'ON_ERROR_STOP=1', '-c', query(submissionId, since)],
    {
      env: { PGHOST: 'localhost', PGDATABASE: 'coursemology', ...process.env },
      encoding: 'utf8',
    },
  );
  return JSON.parse(output);
};

const comparable = (snapshot: Snapshot): string =>
  JSON.stringify({ ...snapshot, pendingJobsSinceMark: undefined });

/** The database's clock, so `since` filters compare against the server's own timestamps. */
export const dbNow = (): string =>
  execFileSync('psql', ['-At', '-c', "select (now() at time zone 'utc')::text"], {
    env: { PGHOST: 'localhost', PGDATABASE: 'coursemology', ...process.env },
    encoding: 'utf8',
  }).trim();

/**
 * Waits until background grading has finished: no job created since `since` is still submitted, no
 * grading run is unfinished, and three reads a second apart agree. A job queued after commit (as on
 * unmark) can start a moment after the request returns, so the first read is delayed.
 */
export const settledSnapshot = async (submissionId: number, since: string): Promise<Snapshot> => {
  await new Promise((resolve) => setTimeout(resolve, 2_000));
  const reads: string[] = [];
  let latest: Snapshot | undefined;

  await expect
    .poll(
      () => {
        latest = read(submissionId, since);
        const busy =
          latest.pendingJobsSinceMark > 0 ||
          latest.answers.some((a) => a.runs?.some((r) => !r.finished && r.jobStatus === 0));
        reads.push(busy ? 'busy' : comparable(latest));
        const lastThree = reads.slice(-3);
        return lastThree.length === 3 && lastThree.every((r) => r !== 'busy' && r === lastThree[0]);
      },
      { message: 'grading never settled', intervals: [1_000], timeout: 180_000 },
    )
    .toBe(true);

  return latest!;
};

/** Labels answers `a1`, `a2`, … per question in the order first seen, kept across snapshots. */
export class AnswerLabels {
  private labels = new Map<number, string>();
  private counts = new Map<number, number>();

  constructor(readonly questionNames: Map<number, string>) {}

  label(answer: AnswerRow): string {
    if (!this.labels.has(answer.id)) {
      const count = (this.counts.get(answer.question_id) ?? 0) + 1;
      this.counts.set(answer.question_id, count);
      this.labels.set(answer.id, `a${count}`);
    }
    return this.labels.get(answer.id)!;
  }

  question(answer: AnswerRow): string {
    return this.questionNames.get(answer.question_id) ?? String(answer.question_id);
  }
}

/** The code version (T, v1, …) an answer holds, from the marker comment each version ends with. */
export const versionOf = (code: string | null): string =>
  code?.match(/#\s*(T|v\d+)\b/)?.[1] ?? '-';

const runSummary = (run: Run): string => {
  if (!run.finished) return run.jobStatus === 2 ? 'errored' : 'pending';
  return `${run.passed}/${run.total}`;
};

/**
 * One line per answer, e.g. `a3★ evaluated v2 runs=[2/2] grade=7`, grouped by question and in the
 * order the answers were created. ★ marks the current answer.
 */
export const describe = (snapshot: Snapshot, labels: AnswerLabels): Record<string, string[]> => {
  const byQuestion: Record<string, string[]> = {};
  for (const answer of snapshot.answers) {
    const question = labels.question(answer);
    const parts = [
      `${labels.label(answer)}${answer.current_answer ? '★' : ''}`,
      answer.workflow_state,
      answer.code !== null ? versionOf(answer.code) : `"${(answer.text ?? '').replace(/<[^>]+>/g, '')}"`,
    ];
    // Other answers also get a run record when graded, but it holds no results.
    if (answer.code !== null && answer.runs?.length) {
      parts.push(`runs=[${answer.runs.map(runSummary).join(',')}]`);
    }
    if (answer.grade !== null) parts.push(`grade=${Number(answer.grade)}`);
    (byQuestion[question] ??= []).push(parts.join(' '));
  }
  return byQuestion;
};

/** Test results each code version should get against the scenarios' two public test cases. */
export const EXPECTED_RESULTS: Record<string, string> = {
  T: '0/2',
  v1: '1/2',
  v2: '2/2',
  v3: '2/2',
  v4: '0/2',
};

/**
 * Checks the invariants that hold in every intended state, and returns the ones that fail, with the reason:
 * - I1: each question has exactly one current answer.
 * - I2: while the submission is attempting, every current answer is attempting.
 * - I3: once the submission is no longer attempting, no current answer is.
 * - I4: an attempting answer has no submission time, grade, grader or grading time.
 * - I5: once the submission is no longer attempting, the latest finished grading run of each current
 *   programming answer has the results of that answer's code (see `EXPECTED_RESULTS`).
 */
export const checkInvariants = (snapshot: Snapshot, labels: AnswerLabels): string[] => {
  const failures: string[] = [];
  const { submission, answers } = snapshot;
  const attempting = submission.workflow_state === 'attempting';
  const current = answers.filter((a) => a.current_answer);

  const questions = new Set(answers.map((a) => a.question_id));
  for (const questionId of questions) {
    const count = current.filter((a) => a.question_id === questionId).length;
    if (count !== 1) {
      failures.push(`I1: ${labels.questionNames.get(questionId)} has ${count} current answers`);
    }
  }

  for (const answer of current) {
    const name = `${labels.question(answer)} ${labels.label(answer)}`;
    if (attempting && answer.workflow_state !== 'attempting') {
      failures.push(`I2: ${name} is ${answer.workflow_state} in an attempting submission`);
    }
    if (!attempting && answer.workflow_state === 'attempting') {
      failures.push(`I3: ${name} is attempting in a ${submission.workflow_state} submission`);
    }
  }

  for (const answer of answers.filter((a) => a.workflow_state === 'attempting')) {
    if (answer.submitted_at || answer.grade !== null || answer.grader_id || answer.graded_at) {
      failures.push(`I4: ${labels.question(answer)} ${labels.label(answer)} is attempting but has grading data`);
    }
  }

  if (!attempting) {
    for (const answer of current.filter((a) => a.code !== null)) {
      const finished = (answer.runs ?? []).filter((r) => r.finished);
      const latest = finished[finished.length - 1];
      const expected = EXPECTED_RESULTS[versionOf(answer.code)];
      const actual = latest ? `${latest.passed}/${latest.total}` : 'no run';
      if (expected && actual !== expected) {
        failures.push(
          `I5: ${labels.question(answer)} ${labels.label(answer)} holds ${versionOf(answer.code)} ` +
            `(expects ${expected}) but its latest run shows ${actual}`,
        );
      }
    }
  }

  return failures;
};
