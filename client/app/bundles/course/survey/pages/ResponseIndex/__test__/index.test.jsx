import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-addons-test-utils';
import { browserHistory } from 'react-router';
import MockAdapter from 'axios-mock-adapter';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import ResponseIndex from '../index';

const client = CourseAPI.survey.responses.getClient();
const mock = new MockAdapter(client);

const responsesData = {
  responses: [{
    course_user: {
      id: 1,
      name: 'Student A',
      phantom: true,
      path: '/courses/1/users/1',
    },
    present: true,
    submitted_at: '2017-03-01T09:10:01.180+08:00',
    path: '/courses/1/surveys/2/responses/5',
  }, {
    course_user: {
      id: 2,
      name: 'Student B',
      phantom: false,
      path: '/courses/1/users/2',
    },
    present: false,
  }, {
    course_user: {
      id: 3,
      name: 'Student C',
      phantom: false,
      path: '/courses/1/users/3',
    },
    present: true,
    submitted_at: null,
    path: '/courses/1/surveys/2/responses/6',
  }, {
    course_user: {
      id: 4,
      name: 'Student D',
      phantom: true,
      path: '/courses/1/users/4',
    },
    present: true,
    submitted_at: '2017-03-03T09:10:01.180+08:00',
    path: '/courses/1/surveys/2/responses/7',
  }],
  survey: {
    id: 2,
    title: 'Test Responses Page',
    end_at: '2017-03-02T09:10:01.180+08:00',
  },
};

beforeEach(() => {
  mock.reset();
  browserHistory.push = jest.fn();
});

describe('<ResponseIndex />', () => {
  it('allows responses to be saved', async () => {
    const surveyId = responsesData.survey.id;
    const responseUrl = `/courses/${courseId}/surveys/${surveyId}/responses`;
    mock.onGet(responseUrl).reply(200, responsesData);
    const spyIndex = jest.spyOn(CourseAPI.survey.responses, 'index');

    // Mount response index page and wait for data to load
    Object.defineProperty(window.location, 'pathname', { value: responseUrl });
    const store = storeCreator({ surveys: {} });
    const contextOptions = {
      context: { intl, store, muiTheme },
      childContextTypes: { muiTheme: React.PropTypes.object, intl: intlShape },
    };
    const responseIndex = mount(
      <ResponseIndex params={{ courseId, surveyId: surveyId.toString() }} />,
      contextOptions
    );
    await sleep(1);

    expect(spyIndex).toHaveBeenCalled();
    const tableBodies = responseIndex.find('TableBody');
    const phantomStudentRows = tableBodies.at(2).find('TableRow');
    const realStudentRows = tableBodies.at(1).find('TableRow');
    const getStatus = row => row.find('td').at(1).text();
    expect(getStatus(phantomStudentRows.first())).toBe('Submitted');
    expect(getStatus(realStudentRows.first())).toBe('Not Started');
    expect(getStatus(realStudentRows.last())).toBe('Responding');

    // Include phantom students in statistics
    const statsCard = responseIndex.find('Card').last();
    const submittedChip = statsCard.find('Chip').last();
    expect(submittedChip.text()).toEqual('0 Submitted');
    statsCard.find('Toggle').first().props().onToggle(null, true);
    expect(submittedChip.text()).toEqual('2 Submitted');

    const backButton = responseIndex.find('TitleBar').first().find('button').first();
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(backButton.node));
    expect(browserHistory.push).toHaveBeenCalledWith('/courses/1/surveys/2');
  });
});
