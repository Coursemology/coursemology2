import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, within } from 'test-utils';

import SegmentedSwitch from '../SegmentedSwitch';

// Render synchronously without the real provider's locale-loading spinner
// (uses the manual mock at lib/components/wrappers/__mocks__/I18nProvider).
jest.mock('lib/components/wrappers/I18nProvider');

const OPTIONS = [
  { value: 'points', label: 'Points' },
  { value: 'percent', label: 'Percentage' },
] as const;

const setup = (
  value: 'points' | 'percent',
  overrides: Partial<
    Parameters<typeof SegmentedSwitch<'points' | 'percent'>>[0]
  > = {},
): { onChange: jest.Mock } => {
  const onChange = jest.fn();
  render(
    <SegmentedSwitch
      ariaLabel="Display mode"
      onChange={onChange}
      options={[...OPTIONS]}
      value={value}
      {...overrides}
    />,
  );
  return { onChange };
};

describe('<SegmentedSwitch />', () => {
  it('renders a radiogroup with one radio per option, named by ariaLabel', () => {
    setup('points');
    const group = screen.getByRole('radiogroup', { name: 'Display mode' });
    expect(within(group).getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByRole('radio', { name: 'Points' })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Percentage' }),
    ).toBeInTheDocument();
  });

  it('marks only the selected option aria-checked', () => {
    setup('percent');
    expect(screen.getByRole('radio', { name: 'Points' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('radio', { name: 'Percentage' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('keeps a single tab stop via roving tabindex', () => {
    setup('points');
    expect(screen.getByRole('radio', { name: 'Points' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('radio', { name: 'Percentage' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('fires onChange with the chosen value when an inactive option is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = setup('points');
    await user.click(screen.getByRole('radio', { name: 'Percentage' }));
    expect(onChange).toHaveBeenCalledWith('percent');
  });

  it('does not fire onChange when the already-active option is clicked', async () => {
    const user = userEvent.setup();
    const { onChange } = setup('points');
    await user.click(screen.getByRole('radio', { name: 'Points' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('moves selection with arrow keys', async () => {
    const user = userEvent.setup();
    const { onChange } = setup('points');
    screen.getByRole('radio', { name: 'Points' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('percent');
  });

  it('wraps arrow navigation at the ends', async () => {
    const user = userEvent.setup();
    const { onChange } = setup('points');
    screen.getByRole('radio', { name: 'Points' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenCalledWith('percent');
  });

  it('disables every option and suppresses onChange when disabled', () => {
    const { onChange } = setup('points', { disabled: true });
    const percent = screen.getByRole('radio', { name: 'Percentage' });
    expect(percent).toBeDisabled();
    fireEvent.click(percent);
    expect(onChange).not.toHaveBeenCalled();
  });
});
