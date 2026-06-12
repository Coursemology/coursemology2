import { render, screen, within } from 'test-utils';

import WeightedGradebookColumnTree from '../components/WeightedGradebookColumnTree';

// Render synchronously without the real provider's locale-loading spinner
// (uses the manual mock at lib/components/wrappers/__mocks__/I18nProvider).
jest.mock('lib/components/wrappers/I18nProvider');

const baseContext = {
  isVisible: (): boolean => false,
  setVisible: (): void => {},
  setManyVisible: (): void => {},
};

describe('WeightedGradebookColumnTree', () => {
  it('renders Student info group with a locked Name and a toggleable Email', () => {
    render(<WeightedGradebookColumnTree {...baseContext} />);
    expect(screen.getByText('Student info')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Always included')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('does not render Gamification group', () => {
    render(<WeightedGradebookColumnTree {...baseContext} />);
    expect(screen.queryByText('Gamification')).not.toBeInTheDocument();
    expect(screen.queryByText('Level')).not.toBeInTheDocument();
    expect(screen.queryByText('Total XP')).not.toBeInTheDocument();
  });

  it('calls setVisible when Email is toggled', async () => {
    const setVisible = jest.fn();
    render(
      <WeightedGradebookColumnTree {...baseContext} setVisible={setVisible} />,
    );
    const emailRow = screen.getByText('Email').closest('label')!;
    within(emailRow).getByRole('checkbox').click();
    expect(setVisible).toHaveBeenCalledWith('email', true);
  });

  it('renders an External ID checkbox in the Student info group', () => {
    render(<WeightedGradebookColumnTree {...baseContext} />);
    expect(
      screen.getByRole('checkbox', { name: /external id/i }),
    ).toBeInTheDocument();
  });

  it('calls setVisible with externalId when the External ID checkbox is toggled', () => {
    const setVisible = jest.fn();
    render(
      <WeightedGradebookColumnTree {...baseContext} setVisible={setVisible} />,
    );
    screen.getByRole('checkbox', { name: /external id/i }).click();
    expect(setVisible).toHaveBeenCalledWith('externalId', true);
  });
});
