import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import storeCreator from 'course/survey/store';
import ResponseForm, { buildInitialValues, buildResponsePayload } from '../index';

const responseData = {
  response: {
    id: 5,
    creator_name: 'user',
    answers: [{
      id: 3,
      question_id: 4,
      present: true,
      text_response: null,
      options: [],
    }, {
      id: 4,
      question_id: 5,
      present: true,
      question_option_ids: [],
    }, {
      id: 5,
      question_id: 6,
      present: true,
      question_option_ids: [3, 4],
    }],
  },
  flags: {
    canModify: true,
    canSubmit: true,
    isResponseCreator: true,
    isSubmitting: false,
  },
  survey: {
    id: 6,
    title: 'Test Response',
    sections: [{
      id: 2,
      weight: 0,
      title: 'Only section',
      questions: [{
        id: 4,
        question_type: 'text',
        description: 'TRQ',
        required: true,
        weight: 0,
      }, {
        id: 5,
        question_type: 'multiple_choice',
        description: 'MCQ',
        required: true,
        weight: 1,
        options: [{
          id: 1,
          option: 'MCQ Option 1',
          weight: 0,
        }, {
          id: 2,
          option: 'MCQ Option 2',
          weight: 1,
        }],
      }, {
        id: 6,
        question_type: 'multiple_response',
        description: 'MRQ',
        min_options: 2,
        max_options: 2,
        required: true,
        weight: 1,
        options: [{
          id: 3,
          option: 'MRQ Option 1',
          weight: 0,
        }, {
          id: 4,
          option: 'MRQ Option 2',
          weight: 1,
        }, {
          id: 5,
          option: 'MRQ Option 3',
          weight: 2,
        }],
      }],
    }],
  },
};

describe('<ResponseForm />', () => {
  it('validates answers', () => {
    const { flags, response, survey } = responseData;
    const mockEndpoint = jest.fn();
    const onSubmit = data => mockEndpoint(buildResponsePayload(data));
    const responseForm = mount(
      <ResponseForm
        {...{ response, flags, onSubmit }}
        initialValues={buildInitialValues(survey, response)}
      />,
      buildContextOptions(storeCreator({}))
    );

    const responseAnswers = responseForm.find('ResponseAnswer');
    const textResponseAnswer = responseAnswers.at(0);
    const multipleChoiceAnswer = responseAnswers.at(1);
    const multipleResponseAnswer = responseAnswers.at(2);

    const lastMRQOptionCheckbox = multipleResponseAnswer.find('OptionsListItem').last().find('Checkbox');
    lastMRQOptionCheckbox.props().onCheck(null, true);

    const submitButton = responseForm.find('button').last();
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(submitButton.node));

    const textResponseAnswerError = textResponseAnswer.find('div').last().text();
    expect(textResponseAnswerError).toEqual('Required');

    const multipleChoiceAnswerError =
      multipleChoiceAnswer.find('renderMultipleChoiceOptions').find('p').first().text();
    expect(multipleChoiceAnswerError).toEqual('Please select at least 1 option(s).');

    const multipleResponseAnswerError =
      multipleResponseAnswer.find('renderMultipleResponseOptions').find('p').first().text();
    expect(multipleResponseAnswerError).toEqual('Please select at most 2 option(s).');

    const textResponse = textResponseAnswer.find('textarea').last();
    const newAnswer = 'New Answer';
    textResponse.simulate('change', { target: { value: newAnswer } });
    const firstMCQOptionRadio = multipleChoiceAnswer.find('OptionsListItem').first().find('RadioButton');
    firstMCQOptionRadio.props().onCheck(null, firstMCQOptionRadio.props().value);
    lastMRQOptionCheckbox.props().onCheck(null, false);

    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(submitButton.node));
    const expectedPayload = {
      response: {
        answers_attributes: [{
          id: 3,
          question_option_ids: [],
          text_response: 'New Answer',
        }, {
          id: 4,
          question_option_ids: [1],
          text_response: undefined,
        }, {
          id: 5,
          question_option_ids: [3, 4],
          text_response: undefined,
        }],
        submit: true,
      },
    };
    expect(mockEndpoint).toHaveBeenCalledWith(expectedPayload);
  });
});
