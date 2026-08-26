import { AppState } from 'store';
import { fireEvent, render, waitFor, within } from 'test-utils';

import LessonPlanFilter from '..';

const DONE_ICON = 'DoneIcon';

// `Partial<AppState>` only allows omitting whole slices, and this test seeds
// just the field the component reads, so the shape is asserted.
const state = {
  lessonPlan: { lessonPlan: { visibilityByType: { Event: true } } },
} as unknown as Partial<AppState>;

describe('<LessonPlanFilter />', () => {
  it('toggles an item type through the store', async () => {
    const page = render(<LessonPlanFilter />, { state });

    fireEvent.click(await page.findByRole('button', { name: 'Filter' }));

    // The tick is rendered from the value the store gives back, so clicking and
    // watching it exercises the whole round trip — including the shape of the
    // payload the action creator is handed.
    const eventType = await page.findByRole('menuitem', { name: /Event/ });
    expect(within(eventType).queryByTestId(DONE_ICON)).toBeInTheDocument();

    fireEvent.click(eventType);

    await waitFor(() =>
      expect(
        within(eventType).queryByTestId(DONE_ICON),
      ).not.toBeInTheDocument(),
    );
  });
});
