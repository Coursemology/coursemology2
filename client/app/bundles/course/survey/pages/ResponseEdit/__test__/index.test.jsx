import { connect } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import storeCreator from 'course/survey/store';
import ResponseEdit from '../index';

const client = CourseAPI.survey.responses.getClient();
const mock = new MockAdapter(client);

const responseData = {
  response: {
    id: 5,
    creator_name: 'user',
    answers: [
      {
        id: 3,
        question_id: 4,
        present: true,
        text_response: 'Current answer',
        options: [],
      },
    ],
  },
  survey: {
    id: 6,
    title: 'Test Response',
    description: 'Form working?',
    sections: [
      {
        id: 2,
        weight: 0,
        title: 'Only section',
        description: 'Has one question',
        questions: [
          {
            id: 4,
            question_type: 'text',
            description: 'Why?',
            required: true,
            weight: 0,
          },
        ],
      },
    ],
  },
  flags: {
    canModify: true,
    canSubmit: true,
    canUnsubmit: false,
    isResponseCreator: true,
  },
};

beforeEach(() => {
  mock.reset();
});

const InjectedResponseEdit = connect((state) => ({
  survey: state.surveys[0] || {},
}))(ResponseEdit);

describe('<ResponseEdit />', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('allows responses to be saved', async () => {
    const surveyId = responseData.survey.id.toString();
    const responseId = responseData.response.id.toString();
    const responseUrl = `/courses/${courseId}/surveys/${surveyId}/responses/${responseId}/edit`;
    mock.onGet(responseUrl).reply(200, responseData);
    const spyEdit = jest.spyOn(CourseAPI.survey.responses, 'edit');
    const spyUpdate = jest.spyOn(CourseAPI.survey.responses, 'update');

    // Mount response show page and wait for data to load
    window.history.pushState({}, '', responseUrl);
    const responseShow = mount(
      <MemoryRouter initialEntries={[responseUrl]}>
        <InjectedResponseEdit {...{ match: { params: { responseId } } }} />
      </MemoryRouter>,
      buildContextOptions(storeCreator({})),
    );
    await sleep(1);
    expect(spyEdit).toHaveBeenCalled();
    responseShow.update();

    // Fill and submit response form
    const responseForm = responseShow.find('ResponseForm').first();
    const textResponse = responseForm.find('textarea').last();
    const newAnswer = 'New Answer';
    textResponse.simulate('change', { target: { value: newAnswer } });
    const submitButton = responseForm
      .find('WithStyles(ForwardRef(Button))')
      .at(1)
      .find('button')
      .first();
    submitButton.simulate('click');

    const expectedPayload = {
      response: {
        answers_attributes: [
          { id: 3, text_response: newAnswer, question_option_ids: [] },
        ],
        submit: true,
      },
    };
    expect(spyUpdate).toHaveBeenCalledWith(responseId, expectedPayload);
  });
});
