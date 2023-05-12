import { render, RenderResult } from 'test-utils';

import LoadingIndicator, {
  LOADING_INDICATOR_TEST_ID,
} from '../LoadingIndicator';

let documentBody: RenderResult;

describe('<LoadingIndicator />', () => {
  beforeEach(() => {
    documentBody = render(<LoadingIndicator />);
  });

  it('shows the loading indicator', () => {
    expect(documentBody.getByTestId(LOADING_INDICATOR_TEST_ID)).toBeVisible();
  });

  it('matches the snapshot', () => {
    const { baseElement } = documentBody;
    expect(baseElement).toMatchSnapshot();
  });
});
