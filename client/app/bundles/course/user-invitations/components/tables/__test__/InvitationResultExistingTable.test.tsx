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
