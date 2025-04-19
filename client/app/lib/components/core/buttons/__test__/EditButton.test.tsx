import {
  render,
  RenderResult,
  screen,
  waitForElementToBeRemoved,
} from 'test-utils';

import EditButton from '../EditButton';

let documentBody: RenderResult;

describe('<EditButton />', () => {
  beforeEach(() => {
    documentBody = render(<EditButton onClick={jest.fn()} />);
  });

  it('shows the edit icon button', async () => {
    expect(await documentBody.findByTestId('EditIconButton')).toBeVisible();
    expect(documentBody.getByTestId('EditIcon')).toBeVisible();
  });

  it('matches the snapshot', async () => {
    const { baseElement } = documentBody;
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    expect(baseElement).toMatchSnapshot();
  });
});
