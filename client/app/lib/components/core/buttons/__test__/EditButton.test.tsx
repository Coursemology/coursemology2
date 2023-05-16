import { render, RenderResult } from 'test-utils';

import EditButton from '../EditButton';

let documentBody: RenderResult;

describe('<EditButton />', () => {
  beforeEach(() => {
    documentBody = render(<EditButton onClick={jest.fn()} />);
  });

  it('shows the edit icon button', () => {
    expect(documentBody.getByTestId('EditIconButton')).toBeVisible();
    expect(documentBody.getByTestId('EditIcon')).toBeVisible();
  });

  it('matches the snapshot', () => {
    const { baseElement } = documentBody;
    expect(baseElement).toMatchSnapshot();
  });
});
