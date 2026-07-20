import { render } from 'test-utils';

import MarketplaceAllowlistTable from '../MarketplaceAllowlistTable';

const ZERO_MATCH_WARNING =
  'No eligible staff currently match this rule, so it grants access to nobody.';

const DOMAIN_RULE = {
  id: 10,
  ruleType: 'email_domain' as const,
  userId: null,
  userName: null,
  userEmail: null,
  instanceId: null,
  instanceName: null,
  emailDomain: 'typo.edu.sg',
};

const USER_RULE = {
  id: 11,
  ruleType: 'user' as const,
  userId: 7,
  userName: 'Jane Tan',
  userEmail: 'jane@nus.edu.sg',
  instanceId: null,
  instanceName: null,
  emailDomain: null,
};

const INSTANCE_RULE = {
  id: 12,
  ruleType: 'instance' as const,
  userId: null,
  userName: null,
  userEmail: null,
  instanceId: 3,
  instanceName: 'NUS',
  emailDomain: null,
};

const renderTable = (
  matchCounts: Map<number, number> | null,
  rules: (typeof DOMAIN_RULE | typeof USER_RULE | typeof INSTANCE_RULE)[] = [
    DOMAIN_RULE,
  ],
): ReturnType<typeof render> =>
  render(
    <MarketplaceAllowlistTable
      matchCounts={matchCounts}
      onDelete={jest.fn().mockResolvedValue(undefined)}
      rules={rules}
    />,
  );

it('warns on a rule that a loaded access list grants to nobody', async () => {
  // Empty map = the list has loaded and this rule has no entry, so it matches nobody. The tooltip
  // text is reachable by accessible name (aria-label) without hovering.
  const page = renderTable(new Map());

  expect(await page.findByLabelText(ZERO_MATCH_WARNING)).toBeInTheDocument();
  // The icon only qualifies the target; the value itself is still shown.
  expect(page.getByText('typo.edu.sg')).toBeVisible();
});

it('does not warn on a rule that grants access to at least one person', async () => {
  const page = renderTable(new Map([[10, 3]]));

  expect(await page.findByText('typo.edu.sg')).toBeVisible();
  expect(page.queryByLabelText(ZERO_MATCH_WARNING)).not.toBeInTheDocument();
});

it('shows no warning before the access list has loaded', async () => {
  // Null = unknown, not zero. A warning here would flash an icon on every rule on first paint —
  // the regression this guards against.
  const page = renderTable(null);

  expect(await page.findByText('typo.edu.sg')).toBeVisible();
  expect(page.queryByLabelText(ZERO_MATCH_WARNING)).not.toBeInTheDocument();
});

it('warns on a zero-match user rule, not only email-domain rules', async () => {
  // The condition is matchCounts.has(id), uniform across rule types. Narrowing it to email_domain
  // would leave a user rule that manages nobody just as invisible as it is today.
  const page = renderTable(new Map(), [USER_RULE]);

  expect(await page.findByLabelText(ZERO_MATCH_WARNING)).toBeInTheDocument();
  expect(page.getByRole('link', { name: 'Jane Tan' })).toBeInTheDocument();
});

it('warns on a zero-match instance rule, completing the three rule types', async () => {
  // matchesNobody keys off matchCounts.has(id) and never branches on ruleType, so the instance
  // path must warn identically. This also exercises the only otherwise-untested target branch:
  // targetOf's instanceName render.
  const page = renderTable(new Map(), [INSTANCE_RULE]);

  expect(await page.findByLabelText(ZERO_MATCH_WARNING)).toBeInTheDocument();
  // The icon only qualifies the target; the instance name is still shown.
  expect(page.getByText('NUS')).toBeVisible();
});
