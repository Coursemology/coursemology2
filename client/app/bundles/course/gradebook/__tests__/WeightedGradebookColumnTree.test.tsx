import { render, screen, within } from 'test-utils';

import WeightedGradebookColumnTree from '../components/WeightedGradebookColumnTree';

// Render synchronously without the real provider's locale-loading spinner
// (uses the manual mock at lib/components/wrappers/__mocks__/I18nProvider).
jest.mock('lib/components/wrappers/I18nProvider');

const STUDENT_INFO = 'Student info';

const baseContext = {
  isVisible: (): boolean => false,
  setVisible: (): void => {},
  setManyVisible: (): void => {},
};

describe('WeightedGradebookColumnTree', () => {
  it('renders Student info group with a locked Name and a toggleable Email', () => {
    render(<WeightedGradebookColumnTree {...baseContext} />);
    expect(screen.getByText(STUDENT_INFO)).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Always included')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders Name as a checked, disabled checkbox that cannot be toggled', () => {
    const setVisible = jest.fn();
    render(
      <WeightedGradebookColumnTree {...baseContext} setVisible={setVisible} />,
    );
    const nameRow = screen.getByText('Name').closest('label')!;
    const nameCheckbox = within(nameRow).getByRole('checkbox');
    expect(nameCheckbox).toBeChecked();
    expect(nameCheckbox).toBeDisabled();
    nameCheckbox.click();
    expect(setVisible).not.toHaveBeenCalled();
  });

  it('renders Email and External ID checked when isVisible returns true', () => {
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        isVisible={(): boolean => true}
      />,
    );
    const emailRow = screen.getByText('Email').closest('label')!;
    expect(within(emailRow).getByRole('checkbox')).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /external id/i }),
    ).toBeChecked();
  });

  it('calls setVisible with false when a visible Email checkbox is unchecked', () => {
    const setVisible = jest.fn();
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        isVisible={(): boolean => true}
        setVisible={setVisible}
      />,
    );
    const emailRow = screen.getByText('Email').closest('label')!;
    within(emailRow).getByRole('checkbox').click();
    expect(setVisible).toHaveBeenCalledWith('email', false);
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

  it('renders the Student info parent checkbox unchecked when no children are visible', () => {
    render(<WeightedGradebookColumnTree {...baseContext} />);
    const groupRow = screen.getByText(STUDENT_INFO).closest('label')!;
    expect(within(groupRow).getByRole('checkbox')).not.toBeChecked();
  });

  it('renders the Student info parent checkbox checked when all children are visible', () => {
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        isVisible={(): boolean => true}
      />,
    );
    const groupRow = screen.getByText(STUDENT_INFO).closest('label')!;
    expect(within(groupRow).getByRole('checkbox')).toBeChecked();
  });

  it('shows the Student info parent checkbox as indeterminate when only some children are visible', () => {
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        isVisible={(id): boolean => id === 'email'}
      />,
    );
    expect(
      screen.getByRole('checkbox', { name: /student info/i }),
    ).toHaveAttribute('data-indeterminate', 'true');
  });

  it('calls setManyVisible to bulk-show all Student info columns when the parent is checked', () => {
    const setManyVisible = jest.fn();
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        setManyVisible={setManyVisible}
      />,
    );
    const groupRow = screen.getByText(STUDENT_INFO).closest('label')!;
    within(groupRow).getByRole('checkbox').click();
    expect(setManyVisible).toHaveBeenCalledWith(
      ['name', 'email', 'externalId'],
      true,
    );
  });

  it('calls setManyVisible to bulk-hide all Student info columns when the parent is unchecked', () => {
    const setManyVisible = jest.fn();
    render(
      <WeightedGradebookColumnTree
        {...baseContext}
        isVisible={(): boolean => true}
        setManyVisible={setManyVisible}
      />,
    );
    const groupRow = screen.getByText(STUDENT_INFO).closest('label')!;
    within(groupRow).getByRole('checkbox').click();
    expect(setManyVisible).toHaveBeenCalledWith(
      ['name', 'email', 'externalId'],
      false,
    );
  });
});
