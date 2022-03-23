import shallowUntil from 'testUtils/shallowUntil';
import Toggle from '../Toggle';

describe('<Toggle />', () => {
  it('renders a toggled toggle', () => {
    const ToggleInput = shallowUntil(
      <Toggle
        input={{
          name: 'Awesome toggle',
          value: true,
          onChange: jest.fn(),
        }}
      />,
      buildContextOptions(),
      'Toggle',
    );

    expect(ToggleInput).toMatchSnapshot();
  });

  it('renders a toggle with an error', () => {
    const ToggleInput = shallowUntil(
      <Toggle
        input={{
          name: 'Not very awesome toggle',
          value: false,
          onChange: jest.fn(),
        }}
        meta={{
          error: 'Ooops',
          touched: true,
        }}
      />,
      buildContextOptions(),
      'Toggle',
    );

    expect(ToggleInput).toMatchSnapshot();
  });
});
