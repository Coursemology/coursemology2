import { render, RenderResult } from 'test-utils';

import PageHeader from '../PageHeader';

let documentBody: RenderResult;

describe('<PageHeader />', () => {
  describe('when there is no return link', () => {
    beforeEach(() => {
      documentBody = render(<PageHeader title="Test Title 1" />);
    });

    it('renders TitleBar and shows the title', () => {
      expect(documentBody.getByText('Test Title 1')).toBeVisible();
    });

    it('does not show the return/back button', () => {
      expect(
        documentBody.queryByTestId('ArrowBackIconButton'),
      ).not.toBeInTheDocument();
    });

    it('matches the snapshot', () => {
      const { baseElement } = documentBody;
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('when there is a return link', () => {
    beforeEach(() => {
      documentBody = render(
        <PageHeader returnLink="some/link" title="Test Title 2" />,
      );
    });

    it('renders TitleBar and shows the title', () => {
      expect(documentBody.getByText('Test Title 2')).toBeVisible();
    });

    it('shows the return/back button', () => {
      expect(documentBody.getByTestId('ArrowBackIconButton')).toBeVisible();
    });

    it('matches the snapshot', () => {
      const { baseElement } = documentBody;
      expect(baseElement).toMatchSnapshot();
    });
  });
});
