import { render, RenderResult } from 'utilities/test-utils';
import LoadingIndicator from '../LoadingIndicator';

let documentBody: RenderResult;

describe('<LoadingIndicator />', () => {
  beforeEach(() => {
    documentBody = render(<LoadingIndicator />);
  });

  it('shows the loading indicator', () => {
    expect(documentBody.getByTestId('CircularProgress')).toBeVisible();
  });

  it('matches the snapshot', () => {
    const { baseElement } = documentBody;
    expect(baseElement).toMatchSnapshot();
  });
});
