import { render, screen } from '@testing-library/react';
import { toast as toastify } from 'react-toastify';

import toast from '../toast';

jest.mock('react-toastify', () => ({ toast: { update: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
});

it('does not wrap ReactNode update messages in revoked Immer proxies', async () => {
  toast.update('toast-id', {
    render: <span>Assessment duplicated.</span>,
    type: 'success',
  });

  const renderedMessage = (toastify.update as jest.Mock).mock.calls[0][1]
    .render;

  expect(() => render(<>{renderedMessage}</>)).not.toThrow();
  expect(await screen.findByText('Assessment duplicated.')).toBeVisible();
});
