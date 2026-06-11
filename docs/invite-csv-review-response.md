# Review response: CSV invite import (header validation + external ID conflicts)

This document addresses the review comments on the invite-from-CSV flow. Each
item lists the **current behaviour**, the **root cause** (with file references),
and a **concrete proposed fix**. The last two items are open
UX questions where a recommendation is given.

Relevant files:

- `client/app/bundles/course/user-invitations/pages/InviteUsersFileUpload/index.tsx`
- `client/app/bundles/course/user-invitations/components/misc/ExternalIdConflictPrompt.tsx`
- `client/app/bundles/course/user-invitations/components/forms/InviteUsersFileUploadForm.tsx`
- `client/app/bundles/course/user-invitations/components/forms/IndividualInviteForm.tsx`
- `client/app/bundles/course/user-invitations/operations.ts`
- `app/services/concerns/course/user_invitation_service/parse_invitation_concern.rb`
- `app/services/course/user_invitation_service.rb`
- `config/locales/{en,zh,ko}/csv.yml`, `config/locales/{en,zh,ko}/errors.yml`

---

## 1. Importing ~500 students (≈5s) bounces the user back to the file-upload prompt from the conflict prompt

### Current behaviour

When the user resolves an external-ID conflict (clicks **Keep Existing** or
**Replace**), the conflict prompt closes instantly and the original "Invite
Users from File" prompt reappears for the ~5s the backend takes to process the
file. There is no indication that an import is running.

### Root cause

In `InviteUsersFileUpload/index.tsx`, the conflict-resolution handlers clear
`conflictData` *before* the request is dispatched:

```tsx
const handleKeepExisting = (): void => {
  setConflictData(null);                                  // (1) unmounts the prompt immediately
  if (fileRef.current) submitWithResolution(fileRef.current, 'keep_existing');
};
```

The `FileUploadForm` is rendered with `open={open && !conflictData}`
(`index.tsx:245`). The moment `conflictData` becomes `null`, that expression
flips to `true`, so the file-upload dialog re-opens and stays open until
`submitWithResolution` resolves ~5s later. There is also **no loading state and
no toast** on this path (unlike `IndividualInviteForm`, which at least tracks
`isLoading`).

### Proposed fix

Keep the conflict prompt mounted and disable its buttons until the backend
responds, and surface progress via a `loadingToast` (the existing pattern — see
`client/app/lib/hooks/toast/loadingToast.ts` and its usage in
`client/app/bundles/course/experience-points/ExperiencePointsDetails.tsx:92`).

**a) `ExternalIdConflictPrompt.tsx` — accept a `loading` prop and disable/spin the buttons.**
Use `LoadingButton` from `@mui/lab` (already used in
`client/app/bundles/users/pages/ResetPasswordPage.tsx`).

```tsx
interface Props {
  // ...existing props...
  loading?: boolean;
  pendingResolution?: 'keep_existing' | 'replace_all' | null;
}

// in render:
<DialogActions>
  <Button disabled={loading} onClick={onCancel} variant="outlined">
    {t(translations.goBack)}
  </Button>
  <LoadingButton
    disabled={loading}
    loading={loading && pendingResolution === 'keep_existing'}
    onClick={onKeepExisting}
    variant="contained"
  >
    {t(translations.keepExisting)}
  </LoadingButton>
  <LoadingButton
    disabled={loading}
    loading={loading && pendingResolution === 'replace_all'}
    onClick={onReplaceAll}
    variant="contained"
  >
    {t(translations.replace)}
  </LoadingButton>
</DialogActions>
```

The dialog already has `disableEscapeKeyDown` and ignores `backdropClick`, so the
only ways to dismiss it are the three buttons — disabling them fully locks the
prompt during submission. Good.

**b) `InviteUsersFileUpload/index.tsx` — don't clear `conflictData` until the response arrives, and drive a toast.**

```tsx
const [submitting, setSubmitting] = useState(false);
const [pendingResolution, setPendingResolution] =
  useState<ExternalIdResolution | null>(null);

const submitWithResolution = (
  fileEntity: InvitationFileEntity,
  resolution?: ExternalIdResolution,
): Promise<void> => {
  setSubmitting(true);
  const loadToast = loadingToast(t(translations.importInProgress));
  return dispatch(inviteUsersFromFile(fileEntity, resolution))
    .then((response) => {
      if ('conflict' in response) {
        // first round: surface the conflict prompt, dismiss the loading toast
        loadToast.success(t(translations.reviewConflicts)); // or loadToast.update + dismiss
        setConflictData(response.conflict);
      } else {
        loadToast.success(t(translations.importSuccess));
        setConflictData(null);     // only NOW do we leave the prompt
        onClose();
        openResultDialog(response as InvitationResult);
      }
    })
    .catch((error) => {
      loadToast.error(/* derive message via the existing error handler */);
      setConflictData(null);       // failure: close the prompt, error shown in toast
      onClose();
    })
    .finally(() => {
      setSubmitting(false);
      setPendingResolution(null);
    });
};

const handleKeepExisting = (): void => {
  if (!fileRef.current) return;
  setPendingResolution('keep_existing');
  submitWithResolution(fileRef.current, 'keep_existing');   // no early setConflictData(null)
};
// handleReplaceAll: same shape with 'replace_all'
```

And pass the new props through:

```tsx
<ExternalIdConflictPrompt
  loading={submitting}
  pendingResolution={pendingResolution}
  onCancel={handleCancel}
  onKeepExisting={handleKeepExisting}
  onReplaceAll={handleReplaceAll}
  ...
/>
```

Notes:

- `handleError` (`useInviteErrorHandler`) currently calls `toast.error` directly.
  To reuse its message-derivation logic with `loadToast.error`, factor the
  "extract first error + overflow" logic into a small helper that returns a
  string, then call `loadToast.error(message)`. This keeps a single toast that
  transitions loading → error rather than stacking two toasts.
- Because the prompt now stays mounted with disabled buttons, the FileUploadForm
  never re-opens mid-flight, fixing the bounce-back.

---

## 2. Re-importing the same file from "Invite Users from File" disables the button (good) but shows no toast

### Current behaviour

`InviteUsersFileUploadForm.tsx` disables the submit via `FormDialog`'s
`isSubmitting`, and `FormSingleFileInput` is disabled while submitting
(`disabled={formState.isSubmitting}`). The button correctly greys out, but there
is no toast telling the user the import is running.

### Root cause

The initial file submit path (`onSubmit` → `submitWithResolution` with no
resolution) has no `loadingToast`. Only the disabled button communicates state.

### Proposed fix

This falls out of the fix for item 1: `submitWithResolution` now always wraps the
dispatch in a `loadingToast`. Since `submitWithResolution` is the single entry
point for both the initial submit (`onSubmit`) and the conflict-resolution
submits, the toast appears on every import attempt — including the first upload —
with no extra code. The `loadToast` should:

- show `importInProgress` ("Importing users from file…") on dispatch,
- transition to `importSuccess` on a non-conflict success,
- transition to error on failure,
- on a *conflict* response, dismiss/settle the loading toast (the conflict prompt
  itself becomes the next signal to the user).

New i18n keys to add under
`course.userInvitations.InviteUsersFileUpload.*` (and `zh`/`ko`):

```
importInProgress: 'Importing users from file…'
importSuccess:    'Users imported successfully.'
```

---

## 3. Reword the instructions now that the CSV template no longer uses brackets

### Current behaviour

The instruction bullets in `InviteUsersFileUpload/index.tsx` (`translations`,
lines ~31–101) still read as a flat list and don't clearly distinguish
required vs optional columns. The template no longer wraps example values in
`[...]` brackets (good — users can copy/paste directly).

### Proposed fix

Adopt the reviewer's wording. Replace/append the leading bullets so required vs
optional is explicit. Suggested message set (English; mirror into `zh.json`,
`ko.json`):

```
fileUploadInfoHeaderRow:
  'A header row is required, and each invitation row must have values in the
   "Name" and "Email" columns. All other columns are optional.'

fileUploadInfoEmail:
  'Email addresses must be unique within the course. Duplicate emails will be skipped.'

fileUploadInfoExternalId:
  'If external IDs are provided, they must be unique within the course. You will
   be given the option to either overwrite or keep existing external IDs.'

fileUploadInfoRole:    (unchanged — "Roles can be [student, observer, …]")
fileUploadInfoPhantom: (unchanged)
fileUploadInfoPersonalTimeline: (unchanged)
```

Implementation notes:

- `fileUploadInfoExternalId` (`index.tsx:65`) currently says external ID
  "overwrites any existing external ID" — that is now stale because the conflict
  prompt lets the user *choose* keep vs overwrite. The reworded copy above fixes
  this inconsistency.
- Add the new `fileUploadInfoHeaderRow` bullet as the first `<li>` in
  `formSubtitle` (`index.tsx:165`).
- The `<code>...</code>` value renderer on the role/phantom messages stays as is.

---

## 4. (Nit) Uploading no CSV / an empty CSV yields a blank "0 new invitations" result dialog instead of an error

### Current behaviour

If the user opens "Invite Users from File" and submits with an empty or
header-only file, the backend parses zero invitations and still returns a success
payload, so `InvitationResultDialog` opens showing "0 new invitations sent, 0
directly enrolled, 0 already in course." The reviewer expects an error here.

### Root cause

`parse_from_file` (`parse_invitation_concern.rb:128`) returns `[]` for a
header-only/empty file and nothing downstream treats an empty parse as an error.
`create_invitation_success` (`user_invitations_controller.rb:317`) renders the
zero-count result normally.

### Proposed fix (backend, recommended)

Raise a `CSV::MalformedCSVError` when a *file* upload produces zero parsable rows.
The controller already maps `CSV::MalformedCSVError` to a `400` with the message
(`user_invitations_controller.rb:144`), and the frontend already renders that via
the error toast (`useInviteErrorHandler`), so no new client plumbing is needed.

In `parse_from_file`, after the `CSV.foreach` loop:

```ruby
raise I18n.t('errors.course.user_invitations.no_invitations') if invites.empty?
```

(Guard it so it only fires when a header row was seen but no data rows followed,
vs. a completely empty file — both should error, but the message can be shared.)

Add to `config/locales/{en,zh,ko}/errors.yml`:

```yaml
no_invitations: 'No invitations found. The file must contain at least one data row below the header.'
```

Scope note: keep this restricted to the *file* path. The form path
(`parse_from_form`) always has at least the one default invitation row, so it is
unaffected; but to be safe, only raise inside `parse_from_file`.

Test: add a fixture-driven case to `spec/services/course/user_invitation_service_spec.rb`
(header-only CSV) and `spec/controllers/course/user_invitations_controller_spec.rb`
asserting a `400` with the new message. The existing `invitation_empty.csv`
fixture can be reused/extended.

---

## 5. (Open question) "Reject unknown headers but accept blank headers" feels inconsistent

### Current behaviour

In `build_header_map!` (`parse_invitation_concern.rb:172`):

- A **non-blank, unrecognised** header → hard error
  (`raise_non_canonical_header_error!`, `:invalid_headers`).
- A **blank** header cell → silently recorded in `blank_header_indices` and
  skipped; if any data row has a value under a blank-header column, a non-fatal
  `@blank_header_warning` is set and surfaced as the yellow `Alert` in
  `InvitationResultDialog` ("One or more columns had no header - their data was
  ignored.").

So a column titled `Nickname` is rejected, but a column with an empty title is
quietly dropped — which the reviewer (rightly) finds asymmetric.

### Why it currently works this way

Blank trailing columns are extremely common in spreadsheet exports (a stray
comma, an empty column N). Hard-failing on them would be hostile, so the code
tolerates them and warns only if they actually carried data. Unknown *named*
headers, by contrast, usually signal a real mistake (typo, wrong template), so a
hard fail is appropriate.

### Recommendation

Keep both behaviours but make them **consistent and visible**, rather than
flipping one to match the other:

- **Don't hard-fail blank headers** (keep current tolerance) — this preserves the
  good "paste from spreadsheet" UX.
- **Promote the blank-header signal to the same severity as unknown headers when
  the blank column carries data.** Today an unknown *named* column with data is a
  hard error, but an unknown *blank* column with data is only a soft warning.
  Align them: if a blank-header column contains data in any row, treat it like an
  unrecognised header and **reject** with a clear message ("Column N has no
  header but contains data; add a header or remove the column"). If the blank
  column is entirely empty, silently ignore it (no warning needed).

This makes the rule easy to state to users:

> Every column that contains data must have a recognised header. Empty columns
> are ignored.

…which is symmetric and intuitive, and removes the "manually delete the column"
annoyance for the genuinely-empty case while still catching real mistakes.

Implementation sketch (`parse_invitation_concern.rb`):

- Keep `blank_header_indices`.
- Change the per-row check from setting `@blank_header_warning` to **collecting**
  which blank-header indices ever held data, then after the loop raise
  `:blank_header_with_data` if that set is non-empty. (This requires deferring the
  raise until after the full scan, or raising on first occurrence — first
  occurrence is simpler and fails fast.)
- Drop the soft-warning UI (`blankHeaderWarning` in
  `InvitationResultDialog.tsx`, `operations.ts`,
  `user_invitations_controller.rb:323`, and the `blankHeaderWarning` field in
  `types/course/userInvitations.ts`) since the condition becomes a hard error.

**This is a behaviour change — flagging for a decision before implementing.**
If you'd prefer the lighter touch, the alternative is to leave the logic as-is
and only improve the *copy* (explain in the instructions that empty columns are
ignored), but that doesn't resolve the asymmetry the reviewer pointed out.

---

## Summary of proposed changes

| # | Area | Change | Risk |
|---|------|--------|------|
| 1 | FE | Keep conflict prompt mounted + disabled while submitting; `loadingToast` for progress | Low |
| 2 | FE | `loadingToast` on every file-import attempt (falls out of #1) | Low |
| 3 | FE i18n | Reword required/optional instructions; fix stale external-ID copy | Low |
| 4 | BE | Raise `CSV::MalformedCSVError` on zero-row file uploads + new i18n key | Low |
| 5 | BE/FE | Make blank-header-with-data a hard error; drop soft-warning UI | **Needs sign-off** |
