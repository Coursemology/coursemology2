import { render, RenderResult } from 'utilities/test-utils';
import PageHeader from '../PageHeader';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: (): void => jest.fn() as unknown as void,
}));

let documentBody: RenderResult;

describe('<PageHeader />', () => {
  describe('when there is no return link', () => {
    beforeEach(() => {
      documentBody = render(<PageHeader title="Test Title 1" />);
    });

    it('renders TitleBar and shows the title', () => {
      expect(documentBody.getByTestId('TitleBar')).toBeVisible();
      expect(documentBody.getByText('Test Title 1')).toBeVisible();
    });

    it('does not show the return/back button', () => {
      expect(documentBody.queryByTestId('ArrowBackIconButton')).toBeNull();
      expect(documentBody.queryByTestId('ArrowBack')).toBeNull();
    });

    it('matches the snapshot', () => {
      const { baseElement } = documentBody;
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('when there is a return link', () => {
    beforeEach(() => {
      documentBody = render(
        <PageHeader title="Test Title 2" returnLink="some/link" />,
      );
    });

    it('renders TitleBar and shows the title', () => {
      expect(documentBody.getByTestId('TitleBar')).toBeVisible();
      expect(documentBody.getByText('Test Title 2')).toBeVisible();
    });

    it('shows the return/back button', () => {
      expect(documentBody.getByTestId('ArrowBackIconButton')).toBeVisible();
      expect(documentBody.getByTestId('ArrowBack')).toBeVisible();
    });

    it('matches the snapshot', () => {
      const { baseElement } = documentBody;
      expect(baseElement).toMatchSnapshot();
    });
  });
});
