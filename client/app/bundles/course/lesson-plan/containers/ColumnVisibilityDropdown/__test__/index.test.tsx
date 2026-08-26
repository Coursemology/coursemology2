import { fireEvent, render, waitFor, within } from 'test-utils';

import ColumnVisibilityDropdown from '..';

const DONE_ICON = 'DoneIcon';

describe('<ColumnVisibilityDropdown />', () => {
  it('toggles a column through the store', async () => {
    const page = render(<ColumnVisibilityDropdown />);

    fireEvent.click(await page.findByRole('button', { name: 'Columns' }));

    // The tick is rendered from the value the store gives back, so clicking and
    // watching it exercises the whole round trip — including the shape of the
    // payload the action creator is handed.
    const endAt = await page.findByRole('menuitem', { name: 'End At' });
    expect(within(endAt).queryByTestId(DONE_ICON)).toBeInTheDocument();

    fireEvent.click(endAt);

    await waitFor(() =>
      expect(within(endAt).queryByTestId(DONE_ICON)).not.toBeInTheDocument(),
    );
  });
});
