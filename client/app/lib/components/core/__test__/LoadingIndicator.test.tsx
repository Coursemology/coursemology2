import {
  render,
  RenderResult,
  screen,
  waitForElementToBeRemoved,
} from 'test-utils';

import LoadingIndicator, {
  LOADING_INDICATOR_TEST_ID,
} from '../LoadingIndicator';

let documentBody: RenderResult;

describe('<LoadingIndicator />', () => {
  beforeEach(async () => {
    documentBody = render(<LoadingIndicator />);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
  });

  it('shows the loading indicator', () => {
    expect(documentBody.getByTestId(LOADING_INDICATOR_TEST_ID)).toBeVisible();
  });

  it('matches the snapshot', () => {
    const { baseElement } = documentBody;
    expect(baseElement).toMatchSnapshot();
  });
});
