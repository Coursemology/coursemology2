# Scenarios on the development server

These Playwright scripts drive a local development server and its database through the UI. Use them to reproduce and investigate behaviour, and port a scenario worth keeping into `tests/tests` or `spec/features`.

They share the suite's setup: specs import `test` and `expect` from `helpers`, and `playwright.scenarios.config.ts` extends `playwright.config.ts`. CI runs only `playwright.config.ts`, whose `testDir` doesn't include this folder, so it never runs them.

Each scenario sets up its own data the way people would: an administrator invites the instructor, the instructor creates the course and assessment and invites the student, and the student attempts it. Only the administrator has to exist beforehand.

## Setup

1. Run the development stack (Rails, the client dev server, and the authentication server).
2. Install the dependencies in `tests/`, skipping the `prepare` script that downloads browsers. Scenarios use the installed Chrome.
   ```bash
   cd tests && yarn install --frozen-lockfile --ignore-scripts
   ```
3. Set these environment variables:

   | Variable | Required | Default | Meaning |
   |---|---|---|---|
   | `CM_DEV_ADMIN_EMAIL` | yes | | An instance administrator on the development database. Scenarios use it to invite the instructor. |
   | `CM_DEV_ADMIN_PASSWORD` | yes | | That account's password. |
   | `CM_DEV_BASE_URL` | no | `scenarioServers.clientURL` in `package.json` (`https://lvh.me:8080`) | Where the client is served. Use `http://localhost:8080` for `yarn build:development`. |
   | `CM_DEV_LOG_PATH` | no | `log/development.log` in this checkout | The log of the Rails server being driven. Point it at the other checkout if the server runs from there. |

## Running

```bash
cd tests
yarn scenarios                             # all scenarios, headless
HEADED=1 yarn scenarios programming-flow   # one scenario, with a visible browser
npx playwright show-report scenario-results/report
```

Every run records a trace, with screenshots, network requests and DOM snapshots for each step. Open it from the report, or with `npx playwright show-trace scenario-results/output/<test>/trace.zip`. Results show development data, so they're written to `scenario-results/`, which git ignores. The main suite's `test-results/` isn't used, because each run of the main suite empties it.

The accounts a scenario creates are attached to its report (`setup.json` or `accounts.json`), so you can sign in as them afterwards. Their addresses start with `scenario-`.

## Scenarios

| Spec | What it does | Takes |
|---|---|---|
| `accounts.spec.ts` | The administrator invites an instructor and a student, who sign up from their emails. A quick check that the setup works. | 30 s |
| `programming-flow.spec.ts` | The plain path through a manually graded programming assessment: the student attempts, checks two versions and finalises, and the grader grades and publishes. | 3 min |
| `md.spec.ts` | A manually graded assessment with delayed grade publication: the grader submits grades for publishing, unsubmits the student, and the student resubmits. This used to end with the stale test results of the November 2026 incident. | 4 min |

Their assessment has a programming question (Q1) and a text response question (Q2). The student types versions of Q1 that each get a different test result, so the result shown reveals which code was graded.

### What they check

Each step is an action through the UI, followed by a snapshot of the submission and its answers from the database, compared with the step's prediction:
- the submission's state;
- each answer's state, whether it is current, which version of the code it holds, its grading runs' results and its grade;
- where the student's page is open, the attempts left that it shows.

Snapshots are taken once background grading has finished, and are checked against the invariants that hold in every intended state (`checkInvariants` in `support/snapshot.ts`).

A mismatch is a soft failure, so a scenario always runs to the end and reports every step. For each step it writes:
- a snapshot (`<step>-snapshot.json`) and a screenshot (`<step>-page.png`), into the test's output folder;
- a section in `scenario-results/<scenario>-results.md`, with the predicted and actual states side by side and any invariant that failed.

Snapshots are read with `psql` from the development database (`coursemology` on localhost; override with the standard `PG*` variables). They only read.

## How mail works here

Development doesn't deliver mail. ActionMailer writes each message, headers and body, to the Rails log at debug level. `support/mail.ts` marks the log's length before an action, then waits for a message `To:` the expected address and takes the link from it. The link's host and scheme come from the mailer's settings, so only its path is kept and visited on `CM_DEV_BASE_URL`.

## Troubleshooting

### Setup stops at "Hold tight, evaluating all submissions with the new package…", or a step reports "grading never settled"

Saving a programming question, Check Answer and Evaluate Answers all run code in an evaluator container. On Apple silicon the evaluator images run under emulation, and a run occasionally hangs at `make public` without using CPU, so the image's CPU-time limit never ends it. Remove the stuck container and run the scenario again:

```bash
docker ps --filter ancestor=coursemology/evaluator-image-python:3.14   # Up for minutes, not seconds
docker rm -f <name>
```

### A sign-up fails with 422

The server checks the reCAPTCHA token with Google, and that check occasionally fails. Run the scenario again.

## Writing scenarios

- Keep UI steps in `support/` as functions that take a `Page`, so they move into `tests/tests` unchanged.
- Give each person their own browser context (`openAs`, `createAccount`, `signUpInNewContext`), so their sessions don't mix.
- Don't create or change data with `rails runner` or SQL. Reading state to check what the UI did is fine.
- Run each step through `StepRecorder` (`support/steps.ts`) with its prediction. It waits for background grading to finish before taking the snapshot.
- Keep Playwright's action timeout (15 s in the config). Without it, a missing element waits for the whole scenario's 10-minute timeout.
