import userEvent from '@testing-library/user-event';
import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor, within } from 'test-utils';

import SystemAPI from 'api/system';

import MarketplaceAllowlistIndex from '../MarketplaceAllowlistIndex';

const mock = createMockAdapter(SystemAPI.admin.client);
beforeEach(() => {
  mock.reset();
  mock.onGet('/admin/marketplace_access').reply(200, {
    users: [],
    summary: { totalWithAccess: 0, openToEveryone: false },
  });
});

const INDEX_URL = '/admin/marketplace_allowlist_rules';
const EMAIL_DOMAIN = 'schools.gov.sg';
const NUS_DOMAIN = 'nus.edu.sg';
const EMAIL_DOMAIN_SUBTITLE = 'Email domain (e.g. schools.gov.sg)';
const OPEN_TO_EVERYONE = 'Open to everyone';
const ADD_ACCESS_RULE = 'Add access rule';
const allowlistGetCount = (): number =>
  mock.history.get.filter((request) => request.url === INDEX_URL).length;
const RULES = [
  {
    id: 1,
    ruleType: 'email_domain',
    userId: null,
    userName: null,
    instanceId: null,
    instanceName: null,
    emailDomain: EMAIL_DOMAIN,
  },
];
const PREVIEW_URL = '/admin/marketplace_allowlist_rules/preview';
const accessGetCount = (): number =>
  mock.history.get.filter(
    (request) => request.url === '/admin/marketplace_access',
  ).length;
// Step 2's preview is a POST too, so `mock.history.post[0]` is the preview, not the create.
const createPosts = (): typeof mock.history.post =>
  mock.history.post.filter((request) => request.url === INDEX_URL);

/**
 * Click step 2's "Confirm add". The button is disabled while the preview request is in flight, so
 * a click fired the moment it appears is swallowed — wait for it to enable first.
 */
const confirmAdd = async (page: ReturnType<typeof render>): Promise<void> => {
  const button = await page.findByRole('button', { name: 'Confirm add' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
};

it('renders the allow-list rules from the API', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES });
  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });

  // Await the fetch firing before asserting the rendered row, so mount + request and the
  // subsequent re-render each get their own waitFor budget (a single window is flaky under load).
  await waitFor(() => expect(allowlistGetCount()).toBe(1));
  await waitFor(() => expect(page.getByText(EMAIL_DOMAIN)).toBeVisible());
});

it('creates an email-domain rule from the add dialog', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: [] });
  mock.onPost(INDEX_URL).reply(200, {
    id: 2,
    ruleType: 'email_domain',
    userId: null,
    userName: null,
    instanceId: null,
    instanceName: null,
    emailDomain: NUS_DOMAIN,
  });
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 1,
    openToEveryone: false,
    users: [],
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(allowlistGetCount()).toBe(1));

  fireEvent.click(page.getByText(ADD_ACCESS_RULE));
  // Rule type defaults to Email domain; fill the value field. (Search fields need userEvent —
  // see client/CLAUDE-testing.md; a plain TextField accepts userEvent.type too.)
  await userEvent.type(page.getByLabelText(EMAIL_DOMAIN_SUBTITLE), NUS_DOMAIN);
  fireEvent.click(page.getByRole('button', { name: 'Next' }));
  await confirmAdd(page);

  await waitFor(() => expect(createPosts()).toHaveLength(1));
  expect(JSON.parse(createPosts()[0].data)).toEqual({
    allowlist_rule: { rule_type: 'email_domain', email_domain: NUS_DOMAIN },
  });
  await waitFor(() => expect(page.getByText(NUS_DOMAIN)).toBeVisible());
});

it('deletes a rule after confirmation', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES });
  mock.onDelete(`${INDEX_URL}/1`).reply(200);

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(page.getByText(EMAIL_DOMAIN)).toBeVisible());

  fireEvent.click(page.getByTestId('DeleteIconButton'));
  fireEvent.click(page.getByRole('button', { name: 'Delete' }));

  await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  await waitFor(() =>
    expect(page.queryByText(EMAIL_DOMAIN)).not.toBeInTheDocument(),
  );
});

it('opens the marketplace to everyone from the banner', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES, everyoneRuleId: null });
  mock.onPost(INDEX_URL).reply(200, { id: 99 });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(page.getByText(EMAIL_DOMAIN)).toBeVisible());

  // Scoped state: the banner switch is off; flipping it on prompts to open.
  fireEvent.click(page.getByRole('checkbox', { name: OPEN_TO_EVERYONE }));

  // Confirm inside the dialog (its primary button shares the label, so scope to the dialog).
  const dialog = page.getByRole('dialog');
  fireEvent.click(
    within(dialog).getByRole('button', { name: OPEN_TO_EVERYONE }),
  );

  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(JSON.parse(mock.history.post[0].data)).toEqual({
    allowlist_rule: { rule_type: 'everyone' },
  });
  await waitFor(() =>
    expect(
      page.getByText(
        'The marketplace is open to all eligible staff: course managers/owners and instance instructors/administrators. The rules below are preserved but inactive.',
      ),
    ).toBeVisible(),
  );
});

it('restricts the marketplace to scoped rules from the banner', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES, everyoneRuleId: 42 });
  mock.onDelete(`${INDEX_URL}/42`).reply(200);

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() =>
    expect(
      page.getByText(
        'The marketplace is open to all eligible staff: course managers/owners and instance instructors/administrators. The rules below are preserved but inactive.',
      ),
    ).toBeVisible(),
  );

  // Open state: the banner switch is on; flipping it off prompts to restrict.
  fireEvent.click(page.getByRole('checkbox', { name: OPEN_TO_EVERYONE }));
  const dialog = page.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Restrict' }));

  await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  expect(mock.history.delete[0].url).toBe(`${INDEX_URL}/42`);
  await waitFor(() =>
    expect(
      page.getByText('Access is limited to the rules below.'),
    ).toBeVisible(),
  );
});

it('disables adding and removing rules while the marketplace is open to everyone', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES, everyoneRuleId: 42 });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(page.getByText(EMAIL_DOMAIN)).toBeVisible());

  // Open-to-everyone means the scoped rules are preserved but inactive: no add, no delete.
  expect(page.getByRole('button', { name: ADD_ACCESS_RULE })).toBeDisabled();
  expect(page.getByTestId('DeleteIconButton')).toBeDisabled();
});

it('disables Next until a required value is entered', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: [] });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(allowlistGetCount()).toBe(1));

  fireEvent.click(page.getByText(ADD_ACCESS_RULE));

  // Default rule type is email_domain → value required → Add disabled while empty.
  expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();

  // Entering the required value enables it.
  await userEvent.type(page.getByLabelText(EMAIL_DOMAIN_SUBTITLE), NUS_DOMAIN);
  expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
});

it('creates a user rule from an email', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: [] });
  mock.onPost(INDEX_URL).reply(200, {
    id: 4,
    ruleType: 'user',
    userId: 7,
    userName: 'Teacher',
    userEmail: 'teacher@school.edu',
    instanceId: null,
    instanceName: null,
    emailDomain: null,
  });
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 1,
    openToEveryone: false,
    users: [],
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(allowlistGetCount()).toBe(1));

  fireEvent.click(page.getByText(ADD_ACCESS_RULE));
  fireEvent.mouseDown(page.getByLabelText('Rule type'));
  fireEvent.click(page.getByRole('option', { name: 'Specific eligible user' }));

  await userEvent.type(
    page.getByLabelText('Eligible user email'),
    'teacher@school.edu',
  );
  fireEvent.click(page.getByRole('button', { name: 'Next' }));
  await confirmAdd(page);

  await waitFor(() => expect(createPosts()).toHaveLength(1));
  expect(JSON.parse(createPosts()[0].data)).toEqual({
    allowlist_rule: { rule_type: 'user', email: 'teacher@school.edu' },
  });

  const link = await page.findByRole('link', { name: 'Teacher' });
  expect(link).toHaveAttribute('href', '/users/7');
  expect(page.getByText('(teacher@school.edu)')).toBeVisible();
});

it('clears the entered value when the rule type changes', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: [] });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(allowlistGetCount()).toBe(1));

  fireEvent.click(page.getByText(ADD_ACCESS_RULE));

  // Enter an email domain, then switch the rule type to "Specific eligible user".
  await userEvent.type(page.getByLabelText(EMAIL_DOMAIN_SUBTITLE), NUS_DOMAIN);
  fireEvent.mouseDown(page.getByLabelText('Rule type'));
  fireEvent.click(page.getByRole('option', { name: 'Specific eligible user' }));

  // The new value field must start empty, not carry over NUS_DOMAIN.
  expect(page.getByLabelText('Eligible user email')).toHaveValue('');
});

it('shows who is eligible for the marketplace', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: [] });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });

  expect(
    await page.findByText(
      'Available to course managers & owners (of any course) and instance instructors & administrators (of any instance). They must also match one of the rules below.',
    ),
  ).toBeVisible();
});

it('renders a user rule as a link to the user with their email', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    rules: [
      {
        id: 5,
        ruleType: 'user',
        userId: 42,
        userName: 'Administrator',
        userEmail: 'admin@org.sg',
        instanceId: null,
        instanceName: null,
        emailDomain: null,
      },
    ],
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });

  const link = await page.findByRole('link', { name: 'Administrator' });
  expect(link).toHaveAttribute('href', '/users/42');
  expect(page.getByText('(admin@org.sg)')).toBeVisible();
});

it('creates an instance rule by picking an instance from the dropdown', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: [] });
  mock.onGet('/admin/instances').reply(200, {
    instances: [
      { id: 1, name: 'Default', host: 'coursemology.org' },
      { id: 2, name: 'Alpha', host: 'alpha.coursemology.org' },
    ],
  });
  mock.onPost(INDEX_URL).reply(200, {
    id: 6,
    ruleType: 'instance',
    userId: null,
    userName: null,
    userEmail: null,
    instanceId: 2,
    instanceName: 'Alpha',
    emailDomain: null,
  });
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 1,
    openToEveryone: false,
    users: [],
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(allowlistGetCount()).toBe(1));

  fireEvent.click(page.getByText(ADD_ACCESS_RULE));
  fireEvent.mouseDown(page.getByLabelText('Rule type'));
  fireEvent.click(
    page.getByRole('option', { name: 'All eligible users in an instance' }),
  );

  // Selecting the instance rule type lazily fetches the instance list.
  await waitFor(() =>
    expect(mock.history.get.some((r) => r.url === '/admin/instances')).toBe(
      true,
    ),
  );

  const combobox = await page.findByRole('combobox', { name: 'Instance' });
  fireEvent.mouseDown(combobox);
  fireEvent.click(page.getByRole('option', { name: 'Alpha' }));

  fireEvent.click(page.getByRole('button', { name: 'Next' }));
  await confirmAdd(page);

  await waitFor(() => expect(createPosts()).toHaveLength(1));
  expect(JSON.parse(createPosts()[0].data)).toEqual({
    allowlist_rule: { rule_type: 'instance', instance_id: 2 },
  });
  await waitFor(() => expect(page.getByText('Alpha')).toBeVisible());
});

it('renders a user rule without an email suffix when none is present', async () => {
  mock.onGet(INDEX_URL).reply(200, {
    rules: [
      {
        id: 8,
        ruleType: 'user',
        userId: 12,
        userName: 'No Email User',
        userEmail: null,
        instanceId: null,
        instanceName: null,
        emailDomain: null,
      },
    ],
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });

  const link = await page.findByRole('link', { name: 'No Email User' });
  expect(link).toHaveAttribute('href', '/users/12');
  // Guard: no ` (…)` suffix — the cell's text is exactly the user name.
  // (A `/\(.*\)/` regex would false-match the eligibility subtitle's "(of any course)";
  // the exact textContent check is robust and still fails if the guard is dropped, since a
  // null email would render "No Email User (null)".)
  expect(link.parentElement?.textContent).toBe('No Email User');
});

it('disables Next for an instance rule until an instance is picked', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: [] });
  mock.onGet('/admin/instances').reply(200, {
    instances: [
      { id: 1, name: 'Default', host: 'coursemology.org' },
      { id: 2, name: 'Alpha', host: 'alpha.coursemology.org' },
    ],
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(allowlistGetCount()).toBe(1));

  fireEvent.click(page.getByText(ADD_ACCESS_RULE));
  fireEvent.mouseDown(page.getByLabelText('Rule type'));
  fireEvent.click(
    page.getByRole('option', { name: 'All eligible users in an instance' }),
  );
  await waitFor(() =>
    expect(mock.history.get.some((r) => r.url === '/admin/instances')).toBe(
      true,
    ),
  );

  expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();

  const combobox = await page.findByRole('combobox', { name: 'Instance' });
  fireEvent.mouseDown(combobox);
  fireEvent.click(page.getByRole('option', { name: 'Alpha' }));

  expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
});

it('keeps the Open to everyone toggle label on a single line', async () => {
  // The open-state banner body is long enough to wrap, which used to drag the toggle label with it.
  mock.onGet(INDEX_URL).reply(200, { rules: RULES, everyoneRuleId: 42 });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });

  const label = await page.findByText(OPEN_TO_EVERYONE);
  expect(label).toHaveClass('whitespace-nowrap');
});

it('refreshes the access list after a rule is added', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: [] });
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 1,
    openToEveryone: false,
    users: [],
  });
  mock.onPost(INDEX_URL).reply(200, {
    id: 2,
    ruleType: 'email_domain',
    userId: null,
    userName: null,
    userEmail: null,
    instanceId: null,
    instanceName: null,
    emailDomain: NUS_DOMAIN,
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(allowlistGetCount()).toBe(1));
  await waitFor(() => expect(accessGetCount()).toBe(1));

  fireEvent.click(page.getByText('Add access rule'));
  await userEvent.type(page.getByLabelText(EMAIL_DOMAIN_SUBTITLE), NUS_DOMAIN);
  fireEvent.click(page.getByRole('button', { name: 'Next' }));
  await confirmAdd(page);

  await waitFor(() => expect(accessGetCount()).toBe(2));
});

it('refreshes the access list after a rule is deleted', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES });
  mock.onDelete(`${INDEX_URL}/1`).reply(200);

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(page.getByText(EMAIL_DOMAIN)).toBeVisible());
  await waitFor(() => expect(accessGetCount()).toBe(1));

  fireEvent.click(page.getByTestId('DeleteIconButton'));
  fireEvent.click(page.getByRole('button', { name: 'Delete' }));

  await waitFor(() => expect(accessGetCount()).toBe(2));
});

it('refreshes the access list after the marketplace is opened to everyone', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES, everyoneRuleId: null });
  mock.onPost(INDEX_URL).reply(200, { id: 99 });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(accessGetCount()).toBe(1));

  fireEvent.click(page.getByRole('checkbox', { name: OPEN_TO_EVERYONE }));
  const dialog = page.getByRole('dialog');
  fireEvent.click(
    within(dialog).getByRole('button', { name: OPEN_TO_EVERYONE }),
  );

  await waitFor(() => expect(accessGetCount()).toBe(2));
});

it('refreshes the access list after the marketplace is restricted again', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES, everyoneRuleId: 42 });
  mock.onDelete(`${INDEX_URL}/42`).reply(200);

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(accessGetCount()).toBe(1));

  fireEvent.click(page.getByRole('checkbox', { name: OPEN_TO_EVERYONE }));
  const dialog = page.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Restrict' }));

  await waitFor(() => expect(accessGetCount()).toBe(2));
});

it('surfaces the server message when a rule is rejected as a duplicate', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: [] });
  mock.onPost(PREVIEW_URL).reply(200, {
    matchedCount: 1,
    newCount: 1,
    openToEveryone: false,
    users: [],
  });
  mock.onPost(INDEX_URL).reply(400, {
    errors: 'Email domain already has the same rule.',
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(allowlistGetCount()).toBe(1));

  fireEvent.click(page.getByText(ADD_ACCESS_RULE));
  await userEvent.type(page.getByLabelText(EMAIL_DOMAIN_SUBTITLE), NUS_DOMAIN);
  fireEvent.click(page.getByRole('button', { name: 'Next' }));
  await confirmAdd(page);

  // The specific message, not the generic "Failed to add access rule."
  expect(
    await page.findByText('Email domain already has the same rule.'),
  ).toBeVisible();
});

const ZERO_MATCH_WARNING =
  'No eligible staff currently match this rule, so it grants access to nobody.';

it('flags a rule that the loaded access list grants to nobody', async () => {
  // beforeEach returns no access-list users, so the single email-domain rule matches nobody.
  mock.onGet(INDEX_URL).reply(200, { rules: RULES });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });

  expect(await page.findByLabelText(ZERO_MATCH_WARNING)).toBeInTheDocument();
});

it('does not flag a rule that the access list grants to someone', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES });
  mock.onGet('/admin/marketplace_access').reply(200, {
    users: [
      {
        id: 1,
        name: 'Jane Tan',
        email: 'jane@schools.gov.sg',
        courseCount: 1,
        instanceRole: null,
        allowedByRules: [
          { id: 1, ruleType: 'email_domain', labelValue: EMAIL_DOMAIN },
        ],
        systemAdmin: false,
        blocked: false,
        blockId: null,
      },
    ],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  // Wait for the access list to render (counts are published only after it resolves).
  await page.findByText('jane@schools.gov.sg');

  expect(page.queryByLabelText(ZERO_MATCH_WARNING)).not.toBeInTheDocument();
});

it('suppresses zero-match warnings while the marketplace is open to everyone', async () => {
  // Everyone-mode empties scoped_rules, so every rule would report zero — but the mode banner
  // already says the rules are moot, so the page passes null and shows no icons at all.
  mock.onGet(INDEX_URL).reply(200, { rules: RULES, everyoneRuleId: 42 });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(page.getByText(EMAIL_DOMAIN)).toBeVisible());
  await waitFor(() => expect(accessGetCount()).toBe(1));

  expect(page.queryByLabelText(ZERO_MATCH_WARNING)).not.toBeInTheDocument();
});

it('does not flash zero-match warnings while a refetch after restrict is in flight', async () => {
  // Restrict flips openToEveryone off and triggers a refetch. Until it resolves, the previously
  // published counts are stale: everyone-mode publishes an empty map, which would mark every scoped
  // rule as matching nobody. invalidateAccessList must blank matchCounts to null so no false warning
  // shows in that window.
  mock.onGet(INDEX_URL).reply(200, { rules: RULES, everyoneRuleId: 42 });
  mock.onDelete(`${INDEX_URL}/42`).reply(200);

  let releaseSecond = (): void => {};
  let accessCalls = 0;
  mock.onGet('/admin/marketplace_access').reply(() => {
    accessCalls += 1;
    if (accessCalls === 1) {
      // Everyone-mode: users carry no per-rule reasons, so the published map is empty.
      return [
        200,
        { users: [], summary: { totalWithAccess: 0, openToEveryone: true } },
      ];
    }
    // Second fetch (after restrict) stays pending until released.
    return new Promise((resolve) => {
      releaseSecond = (): void =>
        resolve([
          200,
          {
            users: [
              {
                id: 1,
                name: 'Jane',
                email: 'jane@schools.gov.sg',
                courseCount: 1,
                instanceRole: null,
                allowedByRules: [
                  { id: 1, ruleType: 'email_domain', labelValue: EMAIL_DOMAIN },
                ],
                systemAdmin: false,
                blocked: false,
                blockId: null,
              },
            ],
            summary: {
              totalWithAccess: 1,
              totalBlocked: 0,
              openToEveryone: false,
            },
          },
        ]);
    });
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(accessGetCount()).toBe(1));
  await page.findByText(EMAIL_DOMAIN);

  // Restrict: toggle off, then confirm in the dialog.
  fireEvent.click(page.getByRole('checkbox', { name: OPEN_TO_EVERYONE }));
  const dialog = page.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Restrict' }));

  // Refetch is now in flight (second GET pending). No stale zero-match warning may show.
  await waitFor(() => expect(accessGetCount()).toBe(2));
  expect(page.queryByLabelText(ZERO_MATCH_WARNING)).not.toBeInTheDocument();

  // Let the refetch resolve; Jane matches rule 1, so still no warning.
  releaseSecond();
  await page.findByText('jane@schools.gov.sg');
  expect(page.queryByLabelText(ZERO_MATCH_WARNING)).not.toBeInTheDocument();
});
