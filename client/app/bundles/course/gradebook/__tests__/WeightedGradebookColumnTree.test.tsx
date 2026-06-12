import { render, screen, within } from 'test-utils';

import WeightedGradebookColumnTree from '../components/WeightedGradebookColumnTree';

const baseContext = {
  isVisible: (): boolean => false,
  setVisible: (): void => {},
  setManyVisible: (): void => {},
};

describe('WeightedGradebookColumnTree', () => {
  it('renders Student info group with a locked Name and a toggleable Email', () => {
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        gamificationEnabled={false}
      />,
    );
    expect(screen.getByText('Student info')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Always included')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows the Gamification group with Level and Total XP when gamification is enabled', () => {
    render(
      <WeightedGradebookColumnTree {...baseContext} gamificationEnabled />,
    );
    expect(screen.getByText('Gamification')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Total XP')).toBeInTheDocument();
  });

  it('hides the Gamification group when gamification is disabled', () => {
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        gamificationEnabled={false}
      />,
    );
    expect(screen.queryByText('Gamification')).not.toBeInTheDocument();
    expect(screen.queryByText('Level')).not.toBeInTheDocument();
    expect(screen.queryByText('Total XP')).not.toBeInTheDocument();
  });

  it('calls setVisible when Email is toggled', async () => {
    const setVisible = jest.fn();
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        gamificationEnabled={false}
        setVisible={setVisible}
      />,
    );
    const emailRow = screen.getByText('Email').closest('label')!;
    within(emailRow).getByRole('checkbox').click();
    expect(setVisible).toHaveBeenCalledWith('email', true);
  });

  it('renders an External ID checkbox in the Student info group', () => {
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        gamificationEnabled={false}
      />,
    );
    expect(
      screen.getByRole('checkbox', { name: /external id/i }),
    ).toBeInTheDocument();
  });

  it('calls setVisible with externalId when the External ID checkbox is toggled', () => {
    const setVisible = jest.fn();
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        gamificationEnabled={false}
        setVisible={setVisible}
      />,
    );
    screen.getByRole('checkbox', { name: /external id/i }).click();
    expect(setVisible).toHaveBeenCalledWith('externalId', true);
  });
});
