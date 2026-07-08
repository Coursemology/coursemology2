import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from 'test-utils';

import InvitationResultExistingTable from '../InvitationResultExistingTable';

const baseRow = {
  id: 1,
  name: 'Alice Tan',
  email: 'alice@example.com',
  externalId: 'aliceExt',
  role: 'student',
  phantom: false,
};

describe('InvitationResultExistingTable', () => {
  it('renders nothing when rows is empty', async () => {
    render(<InvitationResultExistingTable rows={[]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows Name, Email, Ext ID, Role, Phantom columns', async () => {
    render(<InvitationResultExistingTable rows={[baseRow]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('aliceExt')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('hides Ext ID column when no rows have externalId', async () => {
    render(
      <InvitationResultExistingTable
        rows={[{ ...baseRow, externalId: null }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText('External ID')).not.toBeInTheDocument();
    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
  });

  it('localizes role via roleTranslations', async () => {
    render(
      <InvitationResultExistingTable
        rows={[{ ...baseRow, role: 'teaching_assistant' }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Teaching Assistant')).toBeInTheDocument();
  });

  it('renders Yes for phantom user', async () => {
    render(
      <InvitationResultExistingTable rows={[{ ...baseRow, phantom: true }]} />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  describe('updated row rendering', () => {
    it('renders bold externalId with tooltip "Previously: —" when previousExternalId is null', async () => {
      render(
        <InvitationResultExistingTable
          rows={[{ ...baseRow, externalId: 'newId', previousExternalId: null }]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      const cell = screen.getByText('newId');
      expect(cell.tagName).toBe('STRONG');
      await userEvent.hover(cell);
      expect(await screen.findByText('Previously: —')).toBeInTheDocument();
    });

    it('renders bold externalId with tooltip "Previously: oldId" when previousExternalId is a string', async () => {
      render(
        <InvitationResultExistingTable
          rows={[
            { ...baseRow, externalId: 'newId', previousExternalId: 'oldId' },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      const cell = screen.getByText('newId');
      expect(cell.tagName).toBe('STRONG');
      await userEvent.hover(cell);
      expect(await screen.findByText('Previously: oldId')).toBeInTheDocument();
    });

    it('does not bold externalId for rows without previousExternalId', async () => {
      render(<InvitationResultExistingTable rows={[baseRow]} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      const cell = screen.getByText('aliceExt');
      expect(cell.tagName).not.toBe('STRONG');
    });

    it('renders updated rows before non-updated rows', async () => {
      render(
        <InvitationResultExistingTable
          rows={[
            { ...baseRow, id: 2, name: 'Normal Bob' },
            {
              ...baseRow,
              id: 1,
              name: 'Updated Alice',
              externalId: 'newId',
              previousExternalId: 'oldId',
            },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      const normalCell = screen.getByText('Normal Bob');
      const updatedCell = screen.getByText('Updated Alice');
      expect(
        // eslint-disable-next-line no-bitwise
        normalCell.compareDocumentPosition(updatedCell) &
          Node.DOCUMENT_POSITION_PRECEDING,
      ).toBeTruthy();
    });

    it('applies highlight class to updated rows', async () => {
      const { container } = render(
        <InvitationResultExistingTable
          rows={[
            { ...baseRow, externalId: 'newId', previousExternalId: 'oldId' },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      const highlighted = Array.from(container.querySelectorAll('tr')).find(
        (tr) => tr.className.includes('bg-[#e3f2fd]'),
      );
      expect(highlighted).toBeDefined();
    });

    it('does not apply highlight class to non-updated rows', async () => {
      const { container } = render(
        <InvitationResultExistingTable rows={[baseRow]} />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      const highlighted = Array.from(container.querySelectorAll('tr')).find(
        (tr) => tr.className.includes('bg-[#e3f2fd]'),
      );
      expect(highlighted).toBeUndefined();
    });
  });

  describe('Personalized Timeline column', () => {
    it('shows column header and algorithm label when showPersonalizedTimelineFeatures is true', async () => {
      render(
        <InvitationResultExistingTable
          rows={[{ ...baseRow, timelineAlgorithm: 'fomo' }]}
          showPersonalizedTimelineFeatures
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('Personalized Timeline')).toBeInTheDocument();
      expect(screen.getByText('Fomo')).toBeInTheDocument();
    });

    it('hides column when showPersonalizedTimelineFeatures is false', async () => {
      render(
        <InvitationResultExistingTable
          rows={[{ ...baseRow, timelineAlgorithm: 'fomo' }]}
          showPersonalizedTimelineFeatures={false}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(
        screen.queryByText('Personalized Timeline'),
      ).not.toBeInTheDocument();
    });

    it('shows dash when timelineAlgorithm is undefined', async () => {
      render(
        <InvitationResultExistingTable
          rows={[baseRow]}
          showPersonalizedTimelineFeatures
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('Personalized Timeline')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});
