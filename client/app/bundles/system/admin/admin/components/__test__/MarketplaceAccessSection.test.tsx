import userEvent from '@testing-library/user-event';
import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor, within } from 'test-utils';
import TestApp from 'utilities/TestApp';

import SystemAPI from 'api/system';

import MarketplaceAccessSection from '../MarketplaceAccessSection';

const mock = createMockAdapter(SystemAPI.admin.client);
beforeEach(() => mock.reset());

const ACCESS_URL = '/admin/marketplace_access';
const BLOCKS_URL = '/admin/marketplace_access_blocks';
const NUS_LABEL = 'nus.edu.sg';
const DORMANT_DAN = 'Dormant Dan';
const ROOT_ADMIN = 'Root Admin';
const EMAIL_NUS_LABEL = 'Email domain (nus.edu.sg)';
const SYSTEM_ADMIN = 'System admin';

const activeUser = {
  id: 1,
  name: 'Jane Tan',
  email: 'jane@nus.edu.sg',
  courseCount: 3,
  instanceRole: null,
  allowedByRules: [
    { id: 10, ruleType: 'email_domain' as const, labelValue: NUS_LABEL },
  ],
  systemAdmin: false,
  blocked: false,
  blockId: null,
};

/** Blocked AND still allowed by a rule — a LIVE block, so they belong in the main table. */
const blockedUser = {
  id: 2,
  name: 'Kumar Raj',
  email: 'kumar@sch.edu.sg',
  courseCount: 0,
  instanceRole: 'instructor' as const,
  allowedByRules: [
    { id: 10, ruleType: 'email_domain' as const, labelValue: NUS_LABEL },
  ],
  systemAdmin: false,
  blocked: true,
  blockId: 55,
};

/**
 * Blocked with nothing granting them access — their rule was deleted while the block stood. The
 * block denies nothing today, so this one belongs in the dormant section, not the main table.
 */
const dormantUser = {
  id: 4,
  name: DORMANT_DAN,
  email: 'dan@sch.edu.sg',
  courseCount: 1,
  instanceRole: null,
  allowedByRules: [],
  systemAdmin: false,
  blocked: true,
  blockId: 77,
};

const adminUser = {
  id: 3,
  name: ROOT_ADMIN,
  email: 'root@coursemology.org',
  courseCount: 0,
  instanceRole: null,
  allowedByRules: [],
  systemAdmin: true,
  blocked: false,
  blockId: null,
};

const DOMAIN_RULE = {
  id: 10,
  ruleType: 'email_domain' as const,
  userId: null,
  userName: null,
  userEmail: null,
  instanceId: null,
  instanceName: null,
  emailDomain: NUS_LABEL,
};

const USER_RULE = {
  id: 11,
  ruleType: 'user' as const,
  userId: 1,
  userName: 'Jane Tan',
  userEmail: 'jane@nus.edu.sg',
  instanceId: null,
  instanceName: null,
  emailDomain: null,
};

const openFilter = async (page: ReturnType<typeof render>): Promise<void> => {
  fireEvent.click(page.getByRole('button', { name: 'Filter' }));
  await page.findByRole('menu');
};

const closeFilter = async (page: ReturnType<typeof render>): Promise<void> => {
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(page.queryByRole('menu')).not.toBeInTheDocument());
};

/** Open the filter, toggle one checkbox by its accessible name, then close it. */
const toggleFilter = async (
  page: ReturnType<typeof render>,
  checkboxName: string,
): Promise<void> => {
  await openFilter(page);
  fireEvent.click(page.getByRole('checkbox', { name: checkboxName }));
  await closeFilter(page);
};

const renderSection = (props?: {
  openToEveryone?: boolean;
  ruleVersion?: number;
  rules?: (typeof DOMAIN_RULE | typeof USER_RULE)[];
}): ReturnType<typeof render> =>
  render(
    <MarketplaceAccessSection
      openToEveryone={props?.openToEveryone ?? false}
      rules={props?.rules ?? [DOMAIN_RULE]}
      ruleVersion={props?.ruleVersion ?? 0}
    />,
  );

const accessGetCount = (): number =>
  mock.history.get.filter((request) => request.url === ACCESS_URL).length;

it('renders the access list with annotations and a summary', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();

  expect(await page.findByText('Jane Tan')).toBeVisible();
  expect(page.getByText('jane@nus.edu.sg')).toBeVisible();
  expect(page.getByText('Manages 3 courses')).toBeVisible();
  expect(page.getByText('Instance instructor')).toBeVisible();
  // Both fixtures are allowed by the same rule, so the label appears once per row.
  expect(page.getAllByText(EMAIL_NUS_LABEL)).toHaveLength(2);
  expect(page.getByText('Active')).toBeVisible();
  expect(page.getByText('Blocked')).toBeVisible();
});

it('names the blocked total in the subtitle when anyone is blocked', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();

  expect(
    await page.findByText(
      'Total with access: 1 · Total blocked: 1 · Scoped to the rules above',
    ),
  ).toBeVisible();
});

it('omits the blocked segment when nobody is blocked', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();

  expect(
    await page.findByText('Total with access: 1 · Scoped to the rules above'),
  ).toBeVisible();
});

it('reads the mode from props rather than the fetched summary', async () => {
  // The parent owns the toggle, so a stale server summary must not win.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection({ openToEveryone: true });

  expect(
    await page.findByText('Total with access: 1 · Open to everyone'),
  ).toBeVisible();
});

it('shows Everyone as the reason when the marketplace is open to everyone', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: true },
  });

  const page = renderSection({ openToEveryone: true });

  expect(await page.findByText('Everyone')).toBeVisible();
  expect(page.queryByText(EMAIL_NUS_LABEL)).not.toBeInTheDocument();
});

it('lists every rule that grants a user access', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [
      {
        ...activeUser,
        allowedByRules: [
          { id: 10, ruleType: 'email_domain', labelValue: NUS_LABEL },
          { id: 11, ruleType: 'user', labelValue: 'Jane Tan' },
        ],
      },
    ],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();

  expect(await page.findByText(EMAIL_NUS_LABEL)).toBeVisible();
  expect(page.getByText('User (Jane Tan)')).toBeVisible();
});

it('moves a block with no matching rule into the dormant list', async () => {
  // Their rule was deleted while the block stood. The block denies nothing today, so they are not
  // "people with access" — but it must stay visible and clearable, because re-adding a matching
  // rule would silently leave them blocked.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, dormantUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');

  expect(page.getByText('Dormant blocks (1)')).toBeVisible();
  expect(page.getByText(DORMANT_DAN)).toBeVisible();
  // Counted out of the headline totals, which describe people with access.
  expect(
    page.getByText('Total with access: 1 · Scoped to the rules above'),
  ).toBeVisible();
});

it('keeps a block that a rule still backs in the main table', async () => {
  // This block IS denying access right now, so it belongs with the people it applies to.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [blockedUser],
    summary: { totalWithAccess: 0, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Kumar Raj');

  expect(page.queryByText(/^Dormant blocks/)).not.toBeInTheDocument();
  expect(
    page.getByText(
      'Total with access: 0 · Total blocked: 1 · Scoped to the rules above',
    ),
  ).toBeVisible();
});

it('shows no dormant section when there are no dormant blocks', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');

  expect(page.queryByText(/^Dormant blocks/)).not.toBeInTheDocument();
});

it('treats a block as dormant only outside everyone-mode', async () => {
  // Everyone-mode grants access outside the rules, so an empty allowedByRules is not "no access" —
  // the block is live and the row stays in the main table.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [dormantUser],
    summary: { totalWithAccess: 0, totalBlocked: 1, openToEveryone: true },
  });

  const page = renderSection({ openToEveryone: true });
  await page.findByText(DORMANT_DAN);

  expect(page.queryByText(/^Dormant blocks/)).not.toBeInTheDocument();
});

it('clears a dormant block and drops the row', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, dormantUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });
  mock.onDelete(`${BLOCKS_URL}/77`).reply(200);

  const page = renderSection();
  await page.findByText(DORMANT_DAN);

  fireEvent.click(page.getByRole('button', { name: 'Clear block' }));

  await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  expect(mock.history.delete[0].url).toBe(`${BLOCKS_URL}/77`);

  // Nothing grants them access, so clearing the block removes their last reason to be listed.
  await waitFor(() =>
    expect(page.queryByText(DORMANT_DAN)).not.toBeInTheDocument(),
  );
  expect(page.queryByText(/^Dormant blocks/)).not.toBeInTheDocument();
});

it('pins the width of the two state-driven columns', async () => {
  // Status and Actions are the only columns whose content changes with row STATE
  // (Active↔Blocked, Block↔Unblock), so under table-layout:auto they resize as people are
  // blocked and shift every column to their left. The width must sit on a wrapper INSIDE the cell,
  // not on the cell: a table cell's width is only a suggestion under auto layout, so a cell-level
  // class leaves the shift in place. jsdom does no layout, so this asserts the wrapper exists and
  // is pinned in BOTH states; the visual claim is covered by manual verification.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');

  // Both status states, so a width applied to only one branch of the ternary would fail.
  expect(page.getByText('Blocked').closest('div.w-28')).toBeInTheDocument();
  expect(page.getByText('Active').closest('div.w-28')).toBeInTheDocument();

  // Both action states, for the same reason.
  const reEnable = page.getByRole('button', { name: 'Unblock' });
  const disable = page.getByRole('button', { name: 'Block' });
  expect(reEnable.closest('div.w-24')).toBeInTheDocument();
  expect(disable.closest('div.w-24')).toBeInTheDocument();

  // MUI's button padding and 64px min-width inset each label from the cell edge by a per-label
  // amount, so the two states and the column header start at different x without these.
  expect(reEnable).toHaveClass('min-w-0', 'px-0');
  expect(disable).toHaveClass('min-w-0', 'px-0');
});

it('labels a system admin in both reason columns', async () => {
  // The admin manages nothing and matches no rule, so without the systemAdmin branch these cells
  // would read '—' and 'No matching rule' for someone who in fact bypasses every gate.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [adminUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText(ROOT_ADMIN);

  expect(page.getAllByText(SYSTEM_ADMIN)).toHaveLength(2);
  expect(page.queryByText('No matching rule')).not.toBeInTheDocument();
});

it('labels a system admin as such even when open to everyone', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [adminUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: true },
  });

  const page = renderSection({ openToEveryone: true });
  await page.findByText(ROOT_ADMIN);

  expect(page.getAllByText(SYSTEM_ADMIN)).toHaveLength(2);
  expect(page.queryByText('Everyone')).not.toBeInTheDocument();
});

it('reports filtered counts only while the filter narrows the set', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');

  // Unfiltered: the line would only repeat the totals, so it is absent.
  expect(page.queryByText(/^Filtered:/)).not.toBeInTheDocument();

  await toggleFilter(page, 'Active');

  expect(
    await page.findByText('Filtered: 0 with access · 1 blocked'),
  ).toBeVisible();
  // The totals stay put as the audit anchor rather than being rewritten by the filter.
  expect(
    page.getByText(
      'Total with access: 1 · Total blocked: 1 · Scoped to the rules above',
    ),
  ).toBeVisible();

  await toggleFilter(page, 'Active');

  await waitFor(() =>
    expect(page.queryByText(/^Filtered:/)).not.toBeInTheDocument(),
  );
});

it('offers no disable action for a system admin', async () => {
  // Blocking an admin cannot revoke anything (`can :manage, :all` outranks the allow-list), so the
  // action would be a lie — the row would say "Blocked" while they kept full access.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, adminUser],
    summary: { totalWithAccess: 2, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText(ROOT_ADMIN);

  // Exactly one Block button, and it belongs to the non-admin.
  expect(page.getAllByRole('button', { name: 'Block' })).toHaveLength(1);
  expect(
    page.queryByRole('button', { name: 'Unblock' }),
  ).not.toBeInTheDocument();
});

it('filters system admins in and out via their own option', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, adminUser],
    summary: { totalWithAccess: 2, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText(ROOT_ADMIN);

  await toggleFilter(page, SYSTEM_ADMIN);
  await waitFor(() =>
    expect(page.queryByText(ROOT_ADMIN)).not.toBeInTheDocument(),
  );
  expect(page.getByText('Jane Tan')).toBeVisible();

  await toggleFilter(page, SYSTEM_ADMIN);
  await waitFor(() => expect(page.getByText(ROOT_ADMIN)).toBeVisible());
});

it('keeps a system admin listed when a rule box is unchecked', async () => {
  // An admin carries no rules, so treating rules as the only reasons would drop them from the
  // table the moment any rule filter is touched.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, adminUser],
    summary: { totalWithAccess: 2, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText(ROOT_ADMIN);

  await toggleFilter(page, EMAIL_NUS_LABEL);

  await waitFor(() =>
    expect(page.queryByText('Jane Tan')).not.toBeInTheDocument(),
  );
  expect(page.getByText(ROOT_ADMIN)).toBeVisible();
});

it('offers no system-admin option when nobody listed is one', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');
  await openFilter(page);

  expect(
    page.queryByRole('checkbox', { name: SYSTEM_ADMIN }),
  ).not.toBeInTheDocument();
});

it('links each name to that user', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();

  const link = await page.findByRole('link', { name: 'Jane Tan' });
  expect(link).toHaveAttribute('href', '/users/1');
});

it('refetches the list when the rule version changes', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');
  expect(accessGetCount()).toBe(1);

  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  // rerender bypasses test-utils' TestApp wrapper, so re-wrap to keep providers.
  page.rerender(
    <TestApp>
      <MarketplaceAccessSection
        openToEveryone={false}
        rules={[DOMAIN_RULE]}
        ruleVersion={1}
      />
    </TestApp>,
  );

  await waitFor(() => expect(accessGetCount()).toBe(2));
  expect(await page.findByText('Kumar Raj')).toBeVisible();
});

it('does not refetch when unrelated props change', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');
  expect(accessGetCount()).toBe(1);

  // rerender bypasses test-utils' TestApp wrapper, so re-wrap to keep providers.
  page.rerender(
    <TestApp>
      <MarketplaceAccessSection
        openToEveryone
        rules={[DOMAIN_RULE]}
        ruleVersion={0}
      />
    </TestApp>,
  );

  await waitFor(() =>
    expect(
      page.getByText('Total with access: 1 · Open to everyone'),
    ).toBeVisible(),
  );
  expect(accessGetCount()).toBe(1);
});

it('disables an active user and flips the row to Blocked', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });
  mock.onPost(BLOCKS_URL).reply(200, { id: 77, userId: 1 });

  const page = renderSection();
  await page.findByText('Jane Tan');

  fireEvent.click(page.getByRole('button', { name: 'Block' }));

  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(JSON.parse(mock.history.post[0].data)).toEqual({ user_id: 1 });

  expect(await page.findByRole('button', { name: 'Unblock' })).toBeVisible();
  expect(page.getByText('Blocked')).toBeVisible();
});

it('updates the subtitle counts after a local disable, without refetching', async () => {
  // Block/unblock patch rows in place, so counts must come from the rows, not the server summary.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });
  mock.onPost(BLOCKS_URL).reply(200, { id: 77, userId: 1 });

  const page = renderSection();
  await page.findByText('Jane Tan');

  fireEvent.click(page.getByRole('button', { name: 'Block' }));

  expect(
    await page.findByText(
      'Total with access: 0 · Total blocked: 1 · Scoped to the rules above',
    ),
  ).toBeVisible();
  expect(accessGetCount()).toBe(1);
});

it('re-enables a blocked user and flips the row to Active', async () => {
  // A rule still allows them, so unblocking leaves them listed — the row flips rather than going.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [
      {
        ...blockedUser,
        allowedByRules: [
          {
            id: 10,
            ruleType: 'email_domain' as const,
            labelValue: NUS_LABEL,
          },
        ],
      },
    ],
    summary: { totalWithAccess: 0, totalBlocked: 1, openToEveryone: false },
  });
  mock.onDelete(`${BLOCKS_URL}/55`).reply(200);

  const page = renderSection();
  await page.findByText('Kumar Raj');

  fireEvent.click(page.getByRole('button', { name: 'Unblock' }));

  await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  expect(mock.history.delete[0].url).toBe(`${BLOCKS_URL}/55`);

  expect(await page.findByRole('button', { name: 'Block' })).toBeVisible();
  expect(page.getByText('Active')).toBeVisible();
});

it('keeps an unblocked user listed in everyone-mode, where rules are empty by design', async () => {
  // Everyone-mode grants access outside the rules, so an empty allowedByRules is NOT a signal that
  // they have no access — dropping on empty alone would wrongly remove them here.
  mock.onGet(ACCESS_URL).reply(200, {
    users: [dormantUser], // no rules at all, so only the everyone-mode branch can keep them
    summary: { totalWithAccess: 0, totalBlocked: 1, openToEveryone: true },
  });
  mock.onDelete(`${BLOCKS_URL}/77`).reply(200);

  const page = renderSection({ openToEveryone: true });
  await page.findByText(DORMANT_DAN);

  fireEvent.click(page.getByRole('button', { name: 'Unblock' }));

  expect(await page.findByRole('button', { name: 'Block' })).toBeVisible();
  expect(page.getByText(DORMANT_DAN)).toBeVisible();
});

it('searches by name and email', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');

  await userEvent.type(
    page.getByPlaceholderText('Search by name or email'),
    'kumar@',
  );

  await waitFor(() =>
    expect(page.queryByText('Jane Tan')).not.toBeInTheDocument(),
  );
  expect(page.getByText('Kumar Raj')).toBeVisible();
});

it('shows both active and blocked users by default', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();

  expect(await page.findByText('Jane Tan')).toBeVisible();
  expect(page.getByText('Kumar Raj')).toBeVisible();
});

it('shows only blocked users when Active is unchecked', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');

  await toggleFilter(page, 'Active');

  await waitFor(() =>
    expect(page.queryByText('Jane Tan')).not.toBeInTheDocument(),
  );
  expect(page.getByText('Kumar Raj')).toBeVisible();
});

it('filters to the users a specific rule grants access to', async () => {
  const otherUser = {
    ...activeUser,
    id: 3,
    name: 'Wei Ling',
    email: 'wei@moe.gov.sg',
    allowedByRules: [
      { id: 11, ruleType: 'user' as const, labelValue: 'Wei Ling' },
    ],
  };
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, otherUser],
    summary: { totalWithAccess: 2, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection({ rules: [DOMAIN_RULE, USER_RULE] });
  await page.findByText('Jane Tan');

  // Uncheck the user rule; only the domain-granted user should remain.
  await toggleFilter(page, 'User (Jane Tan)');

  await waitFor(() =>
    expect(page.queryByText('Wei Ling')).not.toBeInTheDocument(),
  );
  // Assert on the email, not the name: 'Jane Tan' is also the user rule's checkbox label, so a
  // name query would match two elements whenever the filter menu is open.
  expect(page.getByText('jane@nus.edu.sg')).toBeVisible();
});

it('hides the rule group when the marketplace is open to everyone', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser],
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: true },
  });

  const page = renderSection({ openToEveryone: true, rules: [DOMAIN_RULE] });
  await page.findByText('Jane Tan');
  await openFilter(page);

  // Scoped to the menu: the table also has a Status column header.
  expect(within(page.getByRole('menu')).getByText('Status')).toBeVisible();
  expect(page.queryByText('Allowed by rule')).not.toBeInTheDocument();
  expect(
    page.queryByRole('checkbox', { name: EMAIL_NUS_LABEL }),
  ).not.toBeInTheDocument();
});

it('badges the filter button while any box is unchecked', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');
  await openFilter(page);

  fireEvent.click(page.getByRole('checkbox', { name: 'Active' }));

  // Scope to the badge: a bare '1' would also match pagination and count text.
  expect(
    await page.findByText('1', { selector: '.MuiBadge-badge' }),
  ).toBeVisible();
});

it('composes the filter with the search field', async () => {
  const otherBlocked = {
    ...blockedUser,
    id: 4,
    name: 'Siti Nur',
    email: 'siti@sch.edu.sg',
    blockId: 56,
  };
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser, otherBlocked],
    summary: { totalWithAccess: 1, totalBlocked: 2, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');

  await toggleFilter(page, 'Active');
  await waitFor(() =>
    expect(page.queryByText('Jane Tan')).not.toBeInTheDocument(),
  );

  await userEvent.type(
    page.getByPlaceholderText('Search by name or email'),
    'siti',
  );

  await waitFor(() =>
    expect(page.queryByText('Kumar Raj')).not.toBeInTheDocument(),
  );
  expect(page.getByText('Siti Nur')).toBeVisible();
});

it('restores everything when the filter is cleared', async () => {
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = renderSection();
  await page.findByText('Jane Tan');

  await toggleFilter(page, 'Active');
  await waitFor(() =>
    expect(page.queryByText('Jane Tan')).not.toBeInTheDocument(),
  );

  await openFilter(page);
  fireEvent.click(page.getByRole('button', { name: 'Clear all' }));
  await closeFilter(page);

  expect(await page.findByText('Jane Tan')).toBeVisible();
  expect(page.getByText('Kumar Raj')).toBeVisible();
});

it("publishes each rule's grant count after the access list loads", async () => {
  const onMatchCounts = jest.fn();
  mock.onGet(ACCESS_URL).reply(200, {
    users: [
      {
        ...activeUser,
        allowedByRules: [
          { id: 10, ruleType: 'email_domain', labelValue: NUS_LABEL },
          { id: 11, ruleType: 'user', labelValue: 'Jane Tan' },
        ],
      },
      blockedUser, // allowedByRules: [rule 10]
    ],
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  const page = render(
    <MarketplaceAccessSection
      onMatchCounts={onMatchCounts}
      openToEveryone={false}
      rules={[DOMAIN_RULE, USER_RULE]}
      ruleVersion={0}
    />,
  );
  await page.findByText('Jane Tan');

  await waitFor(() => expect(onMatchCounts).toHaveBeenCalled());
  const counts: Map<number, number> =
    onMatchCounts.mock.calls[onMatchCounts.mock.calls.length - 1][0];
  // Rule 10 grants both listed users; rule 11 grants only the first.
  expect(counts.get(10)).toBe(2);
  expect(counts.get(11)).toBe(1);
});

it('omits a rule that grants access to nobody from the published counts', async () => {
  // A zero-match rule contributes no key — its absence is what the rules table reads as "nobody".
  const onMatchCounts = jest.fn();
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser], // allowedByRules: [rule 10] only
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = render(
    <MarketplaceAccessSection
      onMatchCounts={onMatchCounts}
      openToEveryone={false}
      rules={[DOMAIN_RULE, USER_RULE]}
      ruleVersion={0}
    />,
  );
  await page.findByText('Jane Tan');

  await waitFor(() => expect(onMatchCounts).toHaveBeenCalled());
  const counts: Map<number, number> =
    onMatchCounts.mock.calls[onMatchCounts.mock.calls.length - 1][0];
  expect(counts.has(11)).toBe(false);
  expect(counts.get(10)).toBe(1);
});

it('republishes counts when the rule version changes', async () => {
  const onMatchCounts = jest.fn();
  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser], // rule 10 grants 1
    summary: { totalWithAccess: 1, totalBlocked: 0, openToEveryone: false },
  });

  const page = render(
    <MarketplaceAccessSection
      onMatchCounts={onMatchCounts}
      openToEveryone={false}
      rules={[DOMAIN_RULE]}
      ruleVersion={0}
    />,
  );
  await page.findByText('Jane Tan');
  await waitFor(() => expect(onMatchCounts).toHaveBeenCalledTimes(1));

  mock.onGet(ACCESS_URL).reply(200, {
    users: [activeUser, blockedUser], // rule 10 now grants 2
    summary: { totalWithAccess: 1, totalBlocked: 1, openToEveryone: false },
  });

  // rerender bypasses test-utils' TestApp wrapper, so re-wrap to keep providers.
  page.rerender(
    <TestApp>
      <MarketplaceAccessSection
        onMatchCounts={onMatchCounts}
        openToEveryone={false}
        rules={[DOMAIN_RULE]}
        ruleVersion={1}
      />
    </TestApp>,
  );

  await waitFor(() => expect(onMatchCounts).toHaveBeenCalledTimes(2));
  const counts: Map<number, number> =
    onMatchCounts.mock.calls[onMatchCounts.mock.calls.length - 1][0];
  expect(counts.get(10)).toBe(2);
});

it('returns to the first page when the filter narrows the result set', async () => {
  // 21 people are granted by the domain rule and 4 by the user rule, so the list spans two pages at
  // the default page size of 20. An admin on page 2 who filters out the domain rule drops to a
  // single page — the table must snap back to page 1 rather than strand them on an empty page 2.
  const domainUsers = Array.from({ length: 21 }, (_, i) => ({
    id: i + 1,
    name: `Domain User ${i + 1}`,
    email: `domain${i + 1}@nus.edu.sg`,
    courseCount: 1,
    instanceRole: null,
    allowedByRules: [
      { id: 10, ruleType: 'email_domain', labelValue: NUS_LABEL },
    ],
    systemAdmin: false,
    blocked: false,
    blockId: null,
  }));
  const userRuleUsers = Array.from({ length: 4 }, (_, i) => ({
    id: 100 + i,
    name: `Rule User ${i + 1}`,
    email: `rule${i + 1}@moe.gov.sg`,
    courseCount: 1,
    instanceRole: null,
    allowedByRules: [{ id: 11, ruleType: 'user', labelValue: 'Jane Tan' }],
    systemAdmin: false,
    blocked: false,
    blockId: null,
  }));
  mock.onGet(ACCESS_URL).reply(200, {
    users: [...domainUsers, ...userRuleUsers],
    summary: { totalWithAccess: 25, totalBlocked: 0, openToEveryone: false },
  });

  const page = renderSection({ rules: [DOMAIN_RULE, USER_RULE] });
  await page.findByText('Domain User 1');

  // Go to page 2 — the four user-rule people live here, past the first 20 domain users.
  fireEvent.click(page.getByRole('button', { name: 'Go to next page' }));
  await page.findByText('Rule User 1');
  expect(page.queryByText('Domain User 1')).not.toBeInTheDocument();

  // Filter out the domain rule: only the four user-rule people remain — a single page.
  await toggleFilter(page, EMAIL_NUS_LABEL);

  // Snapped back to page 1: the remaining people are visible, not stranded behind an empty page 2.
  expect(await page.findByText('Rule User 1')).toBeVisible();
  expect(page.getByText('Rule User 4')).toBeVisible();
});
