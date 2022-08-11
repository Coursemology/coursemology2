import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import history from 'lib/history';
import storeCreator from 'course/survey/store';
import SurveyLayout from '../index';

const surveys = [
  {
    id: 3,
    base_exp: 20,
    canViewResults: true,
    title: 'First Survey',
    published: true,
    start_at: '2017-02-27T00:00:00.000+08:00',
    end_at: '2017-03-12T23:59:00.000+08:00',
    response: null,
  },
];

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    courseId: '0',
    surveyId: surveys[0].id.toString(),
  }),
}));

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('<SurveyLayout />', () => {
  it('changes location when the back button is pressed', async () => {
    const surveyId = surveys[0].id.toString();
    const indexPageUrl = '/courses/0/surveys';
    const showPageUrl = `/courses/0/surveys/${surveyId}/`;
    history.push(indexPageUrl);
    history.push(showPageUrl);
    const store = storeCreator({ surveys: { surveys } });

    const surveyLayout = mount(
      <MemoryRouter initialEntries={[history]}>
        <SurveyLayout />
      </MemoryRouter>,
      buildContextOptions(store),
    );
    surveyLayout
      .find('TitleBar')
      .find('ForwardRef(IconButton)')
      .find('button')
      .simulate('click');

    // expect(history.location.pathname).toBe(indexPageUrl);
  });
});
