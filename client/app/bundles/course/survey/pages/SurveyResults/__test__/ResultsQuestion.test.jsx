import React from 'react';
import { mount } from 'enzyme';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import storeCreator from 'course/survey/store';
import ReactTestUtils from 'react-dom/test-utils';
import ResultsQuestion from '../ResultsQuestion';

const surveyId = '6';

const getTextResponseData = (answerCount) => {
  const answers = [];
  for (let i = 0; i < answerCount; i++) {
    answers.push({
      id: i,
      course_user_name: `S${i}`,
      text_response: `A${i}`,
      response_path: `/courses/${courseId}/surveys/${surveyId}/responses/${i}`,
    });
  }

  return {
    id: 5,
    question_type: 'text',
    description: 'Why?',
    answers,
  };
};

const getMultipleChoiceData = (optionCount) => {
  const options = optionCount < 1 ? [] : [{
    id: 0,
    image_url: 'a.png',
    image_name: 'a.png',
  }];
  for (let i = 1; i < optionCount; i++) {
    options.push({ id: i, option: `O${i}` });
  }

  return {
    id: 6,
    question_type: 'multiple_choice',
    description: 'Which?',
    options,
    answers: [{
      id: 22,
      course_user_id: 122,
      course_user_name: 'Lee',
      response_path: `/courses/${courseId}/surveys/${surveyId}/responses/222`,
      phantom: false,
      question_option_ids: [optionCount > 0 ? optionCount - 1 : 0],
    }],
  };
};

const testExpandLongQuestion = (question) => {
  const resultsQuestion = mount(
    <MemoryRouter>
      <ResultsQuestion {...{ question }} includePhantoms anonymous={false} index={1} />
    </MemoryRouter>,
    buildContextOptions(storeCreator({}))
  );
  expect(resultsQuestion.find('Table')).toHaveLength(0);
  const expandButton = resultsQuestion.find('RaisedButton').first().find('button');
  ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(expandButton.node));
  expect(resultsQuestion.find('Table')).toHaveLength(1);
};

describe('<ResultsQuestion />', () => {
  it('collapses long text response question results', () => {
    const question = getTextResponseData(11);
    testExpandLongQuestion(question);
  });

  it('collapses long multiple response question results', () => {
    const question = getMultipleChoiceData(11);
    testExpandLongQuestion(question);
  });

  it('allows sorting by percentage', () => {
    const question = getMultipleChoiceData(2);
    const resultsQuestion = mount(
      <MemoryRouter>
        <ResultsQuestion {...{ question }} includePhantoms={false} anonymous={false} index={1} />
      </MemoryRouter>,
      buildContextOptions(storeCreator({}))
    );
    const lastOptionCountCell = () => resultsQuestion.find('TableRow').last().find('td').at(3);
    const lastOptionCountBeforeSort = lastOptionCountCell().text();
    expect(lastOptionCountBeforeSort).toBe('1');
    const sortToggle = resultsQuestion.find('Toggle').first();
    sortToggle.props().onToggle(null, true);
    const lastOptionCountAfterSort = lastOptionCountCell().text();
    expect(lastOptionCountAfterSort).toBe('0');
  });
});
