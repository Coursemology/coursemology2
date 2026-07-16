import userEvent from '@testing-library/user-event';
import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor } from 'test-utils';

import SystemAPI from 'api/system';

import MarketplaceAllowlistIndex from '../MarketplaceAllowlistIndex';

const mock = createMockAdapter(SystemAPI.admin.client);
beforeEach(() => mock.reset());

const INDEX_URL = '/admin/marketplace_allowlist_rules';
const RULES = [
  {
    id: 1,
    ruleType: 'email_domain',
    userId: null,
    userName: null,
    instanceId: null,
    instanceName: null,
    emailDomain: 'schools.gov.sg',
  },
];

it('renders the allow-list rules from the API', async () => {
  mock.onGet(INDEX_URL).reply(200, { rules: RULES });
  const page = render(<MarketplaceAllowlistIndex />, { at: [INDEX_URL] });

  await waitFor(() => expect(page.getByText('schools.gov.sg')).toBeVisible());
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
  await waitFor(() => expect(page.getByText('schools.gov.sg')).toBeVisible());

  fireEvent.click(page.getByTestId('DeleteIconButton'));
  fireEvent.click(page.getByRole('button', { name: 'Delete' }));

  await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  await waitFor(() =>
    expect(page.queryByText('schools.gov.sg')).not.toBeInTheDocument(),
  );
});
