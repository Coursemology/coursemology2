import { render, screen } from 'test-utils';

import InlineEditTextField from '../TextField';

describe('<InlineEditTextField /> display field', () => {
  const renderField = (value: string): void => {
    render(
      <InlineEditTextField
        updateValue={(): void => {}}
        value={value}
        variant="standard"
      />,
    );
  };

  it('keeps the value on a single line', async () => {
    renderField('Carol Chen');

    // `truncate` clips to one line with an ellipsis instead of wrapping,
    // which is what stops the cell from growing to two rows.
    expect(await screen.findByText('Carol Chen')).toHaveClass('truncate');
  });

  it('exposes the full value via title so a clipped value stays recoverable', async () => {
    renderField('a-very-long-external-id-that-would-be-clipped');

    expect(
      await screen.findByText('a-very-long-external-id-that-would-be-clipped'),
    ).toHaveAttribute('title', 'a-very-long-external-id-that-would-be-clipped');
  });

  it('renders the edit button in a non-shrinking slot so it never wraps', async () => {
    renderField('Carol Chen');

    // `shrink-0` guarantees the button keeps its width and is never pushed
    // onto a second row when the column is narrow.
    expect(await screen.findByRole('button')).toHaveClass('shrink-0');
  });
});
