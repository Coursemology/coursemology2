import React from 'react';
import shallowUntil from 'utils/shallowUntil';
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
      {
        context: { intl },
        childContextTypes: { intl: intlShape },
      },
      'Toggle'
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
      {
        context: { intl },
        childContextTypes: { intl: intlShape },
      },
      'Toggle'
    );

    expect(ToggleInput).toMatchSnapshot();
  });
});
