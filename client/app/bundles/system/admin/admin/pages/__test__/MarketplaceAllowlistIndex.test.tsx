import userEvent from '@testing-library/user-event';
import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor, within } from 'test-utils';

import SystemAPI from 'api/system';

import MarketplaceAllowlistIndex from '../MarketplaceAllowlistIndex';

const mock = createMockAdapter(SystemAPI.admin.client);
beforeEach(() => mock.reset());

const INDEX_URL = '/admin/marketplace_allowlist_rules';
const EMAIL_DOMAIN = 'schools.gov.sg';
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

it('renders the allow-list rules from the API', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES });
  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });

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
    emailDomain: 'nus.edu.sg',
  });

  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });
  await waitFor(() => expect(mock.history.get).toHaveLength(1));

  fireEvent.click(page.getByText('Add rule'));
  // Rule type defaults to Email domain; fill the value field. (Search fields need userEvent —
  // see client/CLAUDE-testing.md; a plain TextField accepts userEvent.type too.)
  await userEvent.type(
    page.getByLabelText('Email domain (e.g. schools.gov.sg)'),
    'nus.edu.sg',
  );
  fireEvent.click(page.getByRole('button', { name: 'Add' }));

  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(JSON.parse(mock.history.post[0].data)).toEqual({
    allowlist_rule: { rule_type: 'email_domain', email_domain: 'nus.edu.sg' },
  });
  await waitFor(() => expect(page.getByText('nus.edu.sg')).toBeVisible());
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

  // Scoped state: banner offers "Open to everyone".
  fireEvent.click(page.getByRole('button', { name: 'Open to everyone' }));

  // Confirm inside the dialog (its primary button shares the label, so scope to the dialog).
  const dialog = page.getByRole('dialog');
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'Open to everyone' }),
  );

  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(JSON.parse(mock.history.post[0].data)).toEqual({
    allowlist_rule: { rule_type: 'everyone' },
  });
  await waitFor(() =>
    expect(
      page.getByText(
        'The marketplace is open to all course managers. The rules below are preserved but inactive.',
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
        'The marketplace is open to all course managers. The rules below are preserved but inactive.',
      ),
    ).toBeVisible(),
  );

  fireEvent.click(
    page.getByRole('button', { name: 'Restrict to scoped rules' }),
  );
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
  expect(page.getByRole('button', { name: 'Add rule' })).toBeDisabled();
  expect(page.getByTestId('DeleteIconButton')).toBeDisabled();
});
