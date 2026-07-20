import userEvent from '@testing-library/user-event';
import { createMockAdapter } from 'mocks/axiosMock';
import { act, fireEvent, render, waitFor } from 'test-utils';

import SystemAPI from 'api/system';
import { LOADING_INDICATOR_TEST_ID } from 'lib/components/core/LoadingIndicator';

import MarketplaceAllowlistRuleForm from '../MarketplaceAllowlistRuleForm';

const mock = createMockAdapter(SystemAPI.admin.client);
beforeEach(() => mock.reset());

const PREVIEW_URL = '/admin/marketplace_allowlist_rules/preview';
const NUS_DOMAIN = 'nus.edu.sg';
const EMAIL_DOMAIN_SUBTITLE = 'Email domain (e.g. schools.gov.sg)';
const CONFIRM_ADD = 'Confirm add';
const GRANT_ACCESS_TO_STAFF = 'Grants access to 1 eligible staff';

const previewUser = {
  id: 1,
  name: 'Jane Tan',
  email: 'jane@nus.edu.sg',
  courseCount: 2,
  instanceRole: null,
  alreadyHasAccess: false,
  blocked: false,
};

const renderForm = (
  onSubmit = jest.fn().mockResolvedValue(undefined),
  onClose = jest.fn(),
): {
  page: ReturnType<typeof render>;
  onSubmit: jest.Mock;
  onClose: jest.Mock;
} => {
  const page = render(
    <MarketplaceAllowlistRuleForm onClose={onClose} onSubmit={onSubmit} open />,
  );
  return { page, onSubmit, onClose };
};

const fillDomainAndAdvance = async (
  page: ReturnType<typeof render>,
  domain = NUS_DOMAIN,
): Promise<void> => {
  // findBy, not getBy: test-utils' render mounts providers asynchronously, so the dialog's fields
  // are not in the DOM on the first tick.
  await userEvent.type(
    await page.findByLabelText(EMAIL_DOMAIN_SUBTITLE),
    domain,
  );
  fireEvent.click(page.getByRole('button', { name: 'Next' }));
};

it('previews the rule once when advancing to step 2', async () => {
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 12,
    newCount: 5,
    openToEveryone: false,
    users: [previewUser],
  });

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  expect(
    await page.findByText(
      'Grants access to 12 eligible staff · 7 already had access',
    ),
  ).toBeVisible();
  // Settle any post-response re-render before pinning the count: a duplicate request fired from an
  // effect would be recorded AFTER the counts paint, so asserting at paint time would miss exactly
  // the failure this guards against.
  await act(async () => {
    await Promise.resolve();
  });
  expect(mock.history.post).toHaveLength(1);
  expect(JSON.parse(mock.history.post[0].data)).toEqual({
    allowlist_rule: { rule_type: 'email_domain', email_domain: NUS_DOMAIN },
  });
});

it('lists the matched people with links and a new marker', async () => {
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 2,
    newCount: 1,
    openToEveryone: false,
    users: [
      previewUser,
      {
        ...previewUser,
        id: 2,
        name: 'Kumar Raj',
        email: 'kumar@nus.edu.sg',
        // Distinct from Jane's 2 so each row's count is queryable on its own; also covers the
        // singular arm of the `{count, plural, ...}` message.
        courseCount: 1,
        alreadyHasAccess: true,
      },
    ],
  });

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  const link = await page.findByRole('link', { name: 'Jane Tan' });
  expect(link).toHaveAttribute('href', '/users/1');
  expect(page.getByText('New')).toBeVisible();
  expect(page.getByText('Already has access')).toBeVisible();
  expect(page.getByText('Manages 2 courses')).toBeVisible();
  expect(page.getByText('Manages 1 course')).toBeVisible();
  expect(page.getByText('jane@nus.edu.sg')).toBeVisible();
});

it('heads the preview list with its three columns', async () => {
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 1,
    openToEveryone: false,
    users: [previewUser],
  });

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  expect(await page.findByText('Name')).toBeVisible();
  expect(page.getByText('Eligible via')).toBeVisible();
  expect(page.getByText('Status')).toBeVisible();
});

it('drops the table entirely when nobody is matched', async () => {
  // Column headers and pagination chrome around an empty box say nothing the counts line has not
  // already said.
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 0,
    newCount: 0,
    openToEveryone: false,
    users: [],
  });

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  await page.findByText('This rule matches nobody eligible right now.');
  expect(page.queryByRole('table')).not.toBeInTheDocument();
  expect(page.queryByText('Eligible via')).not.toBeInTheDocument();
  expect(
    page.queryByPlaceholderText('Search by name or email'),
  ).not.toBeInTheDocument();
});

it('marks a blocked match', async () => {
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 0,
    openToEveryone: false,
    users: [{ ...previewUser, blocked: true }],
  });

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  expect(await page.findByText('Blocked')).toBeVisible();
});

it('prefers the blocked marker over already-has-access', async () => {
  // A blocked person may also already hold access; "Blocked" is the marker that matters, because
  // the rule will not let them in either way. Without this the two branches could be swapped and
  // every other example would still pass.
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 0,
    openToEveryone: false,
    users: [{ ...previewUser, alreadyHasAccess: true, blocked: true }],
  });

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  expect(await page.findByText('Blocked')).toBeVisible();
  expect(page.queryByText('Already has access')).not.toBeInTheDocument();
});

it('shows a loading state while the preview is in flight', async () => {
  let release = (): void => {};
  mock.onPost(PREVIEW_URL).reply(
    () =>
      new Promise((resolve) => {
        release = (): void =>
          resolve([
            200,
            {
              matchedCount: 1,
              newCount: 1,
              openToEveryone: false,
              users: [previewUser],
            },
          ]);
      }),
  );

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  expect(await page.findByTestId(LOADING_INDICATOR_TEST_ID)).toBeVisible();
  // Confirming before the verdict lands would create a rule the admin never previewed.
  expect(page.getByRole('button', { name: CONFIRM_ADD })).toBeDisabled();

  release();

  expect(await page.findByText(GRANT_ACCESS_TO_STAFF)).toBeVisible();
  expect(page.queryByTestId(LOADING_INDICATOR_TEST_ID)).not.toBeInTheDocument();
  expect(page.getByRole('button', { name: CONFIRM_ADD })).toBeEnabled();
});

it('flags a zero-match rule with a warning severity, and keeps it addable', async () => {
  // The rule matching nobody reports a problem, so the alert is a warning, not an info note; but a
  // zero-match rule is still legitimate (e.g. pre-provisioning a domain before its staff exist), so
  // the add stays enabled. Asserting the severity, not just the text, is what pins info→warning.
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 0,
    newCount: 0,
    openToEveryone: false,
    users: [],
  });

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  const message = await page.findByText(
    'This rule matches nobody eligible right now.',
  );
  expect(message).toBeVisible();
  expect(message.closest('.MuiAlert-root')).toHaveClass(
    'MuiAlert-standardWarning',
  );
  expect(page.getByRole('button', { name: CONFIRM_ADD })).toBeEnabled();
});

it('explains that the rule is inert while the marketplace is open to everyone', async () => {
  // matchedCount 0 as well, so this also pins the branch ORDER: the open-to-everyone message must
  // win over the "matches nobody" one, which is the more useful thing to say here.
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 0,
    newCount: 0,
    openToEveryone: true,
    users: [],
  });

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  expect(
    await page.findByText(
      'The marketplace is currently open to everyone; this rule takes effect only if you restrict access again.',
    ),
  ).toBeVisible();
});

it('blocks a duplicate rule and reports the server message', async () => {
  mock.onPost(PREVIEW_URL).reply(400, {
    errors: 'Email domain already has a rule.',
  });

  const { page, onSubmit } = renderForm();
  await fillDomainAndAdvance(page);

  expect(
    await page.findByText('Email domain already has a rule.'),
  ).toBeVisible();
  expect(page.getByRole('button', { name: CONFIRM_ADD })).toBeDisabled();
  expect(onSubmit).not.toHaveBeenCalled();
});

it('still allows adding when the preview request itself fails', async () => {
  // A preview outage is not a verdict on the rule; it must not block creation.
  mock.onPost(PREVIEW_URL).reply(500);

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  expect(await page.findByText('Could not preview this rule.')).toBeVisible();
  expect(page.getByRole('button', { name: CONFIRM_ADD })).toBeEnabled();
});

it('treats a 400 with no message as an outage, not a verdict', async () => {
  // Only a 400 that says what is wrong is a rejection. A bare 400 is a broken response, and must
  // take the soft path rather than silently blocking creation with no explanation.
  mock.onPost(PREVIEW_URL).reply(400, {});

  const { page } = renderForm();
  await fillDomainAndAdvance(page);

  expect(await page.findByText('Could not preview this rule.')).toBeVisible();
  expect(page.getByRole('button', { name: CONFIRM_ADD })).toBeEnabled();
});

it('submits the rule from step 2', async () => {
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 1,
    openToEveryone: false,
    users: [previewUser],
  });

  const { page, onSubmit } = renderForm();
  await fillDomainAndAdvance(page);
  await page.findByText(GRANT_ACCESS_TO_STAFF);

  fireEvent.click(page.getByRole('button', { name: CONFIRM_ADD }));

  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith({
      ruleType: 'email_domain',
      emailDomain: NUS_DOMAIN,
    }),
  );
});

it('keeps the entered value when going back to step 1', async () => {
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 1,
    openToEveryone: false,
    users: [previewUser],
  });

  const { page } = renderForm();
  await fillDomainAndAdvance(page);
  await page.findByText(GRANT_ACCESS_TO_STAFF);

  fireEvent.click(page.getByRole('button', { name: 'Back' }));

  expect(await page.findByLabelText(EMAIL_DOMAIN_SUBTITLE)).toHaveValue(
    NUS_DOMAIN,
  );
});

it('resets to a clean step 1 when cancelled', async () => {
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 4,
    newCount: 2,
    openToEveryone: false,
    users: [previewUser],
  });

  const { page, onClose } = renderForm();
  await fillDomainAndAdvance(page);
  await page.findByText(
    'Grants access to 4 eligible staff · 2 already had access',
  );

  fireEvent.click(page.getByRole('button', { name: 'Cancel' }));

  expect(onClose).toHaveBeenCalled();

  // The dialog stays mounted (its `open` belongs to the parent), so the reset is observable: back
  // at step 1, value cleared, cached preview discarded. Without this the next open would resume
  // mid-flow, showing a preview of a rule the admin already abandoned.
  expect(await page.findByLabelText(EMAIL_DOMAIN_SUBTITLE)).toHaveValue('');
  expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  expect(
    page.queryByText(
      'Grants access to 4 eligible staff · 2 already had access',
    ),
  ).not.toBeInTheDocument();
});

it('previews a user rule from an email address', async () => {
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 1,
    openToEveryone: false,
    users: [previewUser],
  });

  const { page } = renderForm();

  fireEvent.mouseDown(await page.findByLabelText('Rule type'));
  fireEvent.click(
    page.getByRole('option', { name: 'Specific eligible staff member' }),
  );

  // Surrounding whitespace is a paste artefact, not part of the address.
  await userEvent.type(
    page.getByLabelText('Eligible staff email'),
    '  jane@nus.edu.sg  ',
  );
  fireEvent.click(page.getByRole('button', { name: 'Next' }));

  await page.findByText(GRANT_ACCESS_TO_STAFF);
  expect(JSON.parse(mock.history.post[0].data)).toEqual({
    allowlist_rule: { rule_type: 'user', email: 'jane@nus.edu.sg' },
  });
});

it('previews an instance rule, loading the instance list lazily and once', async () => {
  mock.onGet('/admin/instances').reply(200, {
    instances: [
      { id: 1, name: 'Default', host: 'coursemology.org' },
      { id: 2, name: 'Alpha', host: 'alpha.coursemology.org' },
    ],
  });
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 3,
    newCount: 3,
    openToEveryone: false,
    users: [previewUser],
  });

  const { page } = renderForm();

  // The instance list is not fetched until the instance rule type is chosen.
  expect(await page.findByLabelText('Rule type')).toBeVisible();
  expect(mock.history.get).toHaveLength(0);

  fireEvent.mouseDown(page.getByLabelText('Rule type'));
  fireEvent.click(
    page.getByRole('option', { name: 'All eligible staff in an instance' }),
  );

  await waitFor(() =>
    expect(
      mock.history.get.filter((r) => r.url === '/admin/instances'),
    ).toHaveLength(1),
  );

  // An instance rule has no value until an instance is actually picked.
  expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();

  const combobox = await page.findByRole('combobox', { name: 'Instance' });
  fireEvent.mouseDown(combobox);
  fireEvent.click(page.getByRole('option', { name: 'Alpha' }));

  expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  fireEvent.click(page.getByRole('button', { name: 'Next' }));

  await page.findByText('Grants access to 3 eligible staff');
  expect(JSON.parse(mock.history.post[0].data)).toEqual({
    allowlist_rule: { rule_type: 'instance', instance_id: 2 },
  });
  expect(
    mock.history.get.filter((r) => r.url === '/admin/instances'),
  ).toHaveLength(1);
});

it('clears the entered value when the rule type changes', async () => {
  const { page } = renderForm();

  await userEvent.type(
    await page.findByLabelText(EMAIL_DOMAIN_SUBTITLE),
    NUS_DOMAIN,
  );

  fireEvent.mouseDown(page.getByLabelText('Rule type'));
  fireEvent.click(
    page.getByRole('option', { name: 'Specific eligible staff member' }),
  );

  // A domain is not a plausible email, so it must not carry over into the new field.
  expect(page.getByLabelText('Eligible staff email')).toHaveValue('');
  expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
});

it('does not submit from step 1', async () => {
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 1,
    openToEveryone: false,
    users: [previewUser],
  });

  const { page, onSubmit } = renderForm();
  await fillDomainAndAdvance(page);

  // Next only previews; the rule is created solely by the step 2 confirmation.
  await page.findByText(GRANT_ACCESS_TO_STAFF);
  expect(onSubmit).not.toHaveBeenCalled();
  expect(page.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
});

it('disables Next until a value is entered', async () => {
  const { page } = renderForm();

  expect(await page.findByRole('button', { name: 'Next' })).toBeDisabled();

  await userEvent.type(page.getByLabelText(EMAIL_DOMAIN_SUBTITLE), NUS_DOMAIN);

  expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
});
