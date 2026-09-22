# Working on specs

**Read [README.md](README.md) in this directory first.** It is the human-facing guide and the
source of truth for how to run specs, how to design them, and which pitfalls recur here. It
covers, and this file deliberately does not repeat: the setup steps, the searching/pagination and
record-selection pitfalls, `exact_text` behaviour, toast ordering, and translation handling in the
test environment.

What follows is only the operational layer: how to tell what is already running on this machine,
and what to be careful about when running specs yourself.

## Check what is running before running feature specs

The README lists the prerequisites. They are machine state rather than anything in the repo, so
check rather than assume — a missing service usually surfaces as a misleading error (see the
README's note on Keycloak and `WebDriverError`).

Run these, and specs themselves, from the repo root rather than this directory:

```bash
lsof -nP -iTCP:3200 -sTCP:LISTEN   # dirt-cheap-rocket
lsof -nP -iTCP:8443 -sTCP:LISTEN   # Keycloak (also: docker ps)
ls client/build                    # frontend assets from `yarn build:test`
ls client/.env.test
```

Non-feature specs (models, services, controllers, helpers) need none of this — only the test
database. Prefer running those directly; they are far faster and most work does not need a browser.

## Locating dirt-cheap-rocket

DCR lives outside this repo and each developer puts it somewhere of their own choosing, so there
is no canonical path. A developer who has run feature specs locally will already have it; find
that copy rather than fetching another. It takes either of two shapes, since the README offers a
choice of downloading or building it:

- a checkout of the `dirt-cheap-rocket` repo, with `index.js` and usually `bin/dirt-cheap-rocket.cjs`
- a standalone `dirt-cheap-rocket.cjs` on its own, often still in a downloads directory

Try, roughly in order: any path the user mentions; sibling directories of this repo and the usual
checkout locations (`~/Documents`, `~/src`, `~/code`, `~/projects`); then a bounded search such as

```bash
find ~ -maxdepth 4 -name "dirt-cheap-rocket*" -not -path "*/node_modules/*" 2>/dev/null
```

Expect the search to turn up more than one candidate (a checkout plus stale downloads). Any
working entry point will do — prefer a checkout over a loose script, and confirm which one with
the user if it is ambiguous. Run it with the environment variables the README specifies, from the
repo root, so `DCR_ASSETS_DIR` resolves. It logs `App accessible on port 3200` and
`JSON requests proxied to port 7979` once it is up; Capybara boots Rails on 7979 itself.

If you cannot find a copy, say so and ask, rather than cloning one — where it belongs is the
developer's choice.

## Starting services

Starting DCR or the Keycloak container changes local environment state and leaves long-running
processes behind. Do it when the task needs feature specs, tell the user what you started, and
say how to stop it (`docker compose down` in `authentication/`). Leave them running if more
spec work is likely.

## Running feature specs mutates the shared test database

The database is not cleaned between runs, and feature specs commit. A scenario that deletes a
record really deletes it, and every run leaves new records behind. So:

- Re-running a spec is not guaranteed to be a repeat of the same conditions.
- A spec can pass on a fresh database and fail once enough records accumulate. This is the most
  common reason a spec fails on CI but passes locally.
- Avoid loops that run a destructive feature spec many times; each pass consumes records.

## Verifying a spec you have fixed

A green run is not sufficient evidence that a fixed assertion works, because the failure mode
documented in the README — a filter that silently matches everything — *passes*. Before reporting
a spec fixed, check that it fails when the behaviour it covers is broken: temporarily neuter the
step under test (in a scratch copy of the file, deleted afterwards), confirm the failure lands on
the intended assertion, then restore. If an assertion cannot be made to fail, it is not testing
anything.