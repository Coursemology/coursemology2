import { AppState } from 'store';
import { render } from 'test-utils';

import ObservingAttemptAlert from '../ObservingAttemptAlert';

const WARNING = /has not yet finalised their submission/i;

// Only the two fields the component reads. `Partial<AppState>` allows omitting whole slices but not
// fields within one, hence the cast.
const stateWith = (
  workflowState: string,
  isCreator: boolean,
): Partial<AppState> =>
  ({
    assessments: { submission: { submission: { workflowState, isCreator } } },
  }) as unknown as Partial<AppState>;

// `TestApp` mounts `I18nProvider`, which shows a loading indicator until it has asynchronously
// loaded the locale messages. A synchronous `queryByText` therefore runs before the component under
// test has rendered at all, and would pass whatever the component does. Render a marker alongside
// it and await that first, so an absence assertion is made against a mounted tree.
const renderAlert = async (
  workflowState: string,
  isCreator: boolean,
): Promise<ReturnType<typeof render>> => {
  const page = render(
    <>
      <span data-testid="mounted" />
      <ObservingAttemptAlert />
    </>,
    { state: stateWith(workflowState, isCreator) },
  );

  await page.findByTestId('mounted');

  return page;
};

describe('<ObservingAttemptAlert />', () => {
  it('warns a non-creator viewing an attempt still in progress', async () => {
    const page = await renderAlert('attempting', false);

    expect(page.getByText(WARNING)).toBeVisible();
  });

  it('stays silent for the submission creator', async () => {
    const page = await renderAlert('attempting', true);

    expect(page.queryByText(WARNING)).toBeNull();
  });

  it('stays silent once the submission is no longer attempting', async () => {
    const page = await renderAlert('submitted', false);

    expect(page.queryByText(WARNING)).toBeNull();
  });
});
