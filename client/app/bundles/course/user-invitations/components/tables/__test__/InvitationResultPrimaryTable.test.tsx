import { render, screen, waitForElementToBeRemoved } from 'test-utils';

import InvitationResultPrimaryTable from '../InvitationResultPrimaryTable';

const baseRow = {
  id: 'inv-1',
  name: 'Alice',
  email: 'alice@example.com',
  externalId: null,
  role: 'student',
  phantom: false,
};

describe('InvitationResultPrimaryTable', () => {
  it('renders Name, Email, Role, and Phantom columns', async () => {
    render(<InvitationResultPrimaryTable rows={[baseRow]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('renders Yes for phantom user', async () => {
    render(
      <InvitationResultPrimaryTable rows={[{ ...baseRow, phantom: true }]} />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('localizes role via roleTranslations', async () => {
    render(
      <InvitationResultPrimaryTable
        rows={[{ ...baseRow, role: 'teaching_assistant' }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Teaching Assistant')).toBeInTheDocument();
  });

  it('shows External ID column when any row has a non-null externalId', async () => {
    render(
      <InvitationResultPrimaryTable
        rows={[{ ...baseRow, externalId: 'ext123' }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('External ID')).toBeInTheDocument();
    expect(screen.getByText('ext123')).toBeInTheDocument();
  });

  it('hides External ID column when all rows have null externalId', async () => {
    render(<InvitationResultPrimaryTable rows={[baseRow]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText('External ID')).not.toBeInTheDocument();
  });

  it('renders empty cell for null externalId when column is shown by another row', async () => {
    render(
      <InvitationResultPrimaryTable
        rows={[
          { ...baseRow, id: 'inv-1', externalId: 'ext123' },
          { ...baseRow, id: 'inv-2', name: 'Bob', externalId: null },
        ]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('External ID')).toBeInTheDocument();
    expect(screen.getByText('ext123')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  describe('Personalized Timeline column', () => {
    it('shows column header and algorithm label when showPersonalizedTimelineFeatures is true', async () => {
      render(
        <InvitationResultPrimaryTable
          rows={[{ ...baseRow, timelineAlgorithm: 'otot' }]}
          showPersonalizedTimelineFeatures
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('Personalized Timeline')).toBeInTheDocument();
      expect(screen.getByText('Otot')).toBeInTheDocument();
    });

    it('hides column when showPersonalizedTimelineFeatures is false', async () => {
      render(
        <InvitationResultPrimaryTable
          rows={[{ ...baseRow, timelineAlgorithm: 'otot' }]}
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
        <InvitationResultPrimaryTable
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
