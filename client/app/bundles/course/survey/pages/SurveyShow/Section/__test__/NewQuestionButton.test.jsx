import React from 'react';
import ReactDOM from 'react-dom';
import { mount, ReactWrapper } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import QuestionFormDialogue from 'course/survey/containers/QuestionFormDialogue';
import NewQuestionButton from '../NewQuestionButton';

describe('<NewQuestionButton />', () => {
  it('injects handlers that allow survey questions to be created', () => {
    const spyCreate = jest.spyOn(CourseAPI.survey.questions, 'create');
    const sectionId = 7;
    const contextOptions = buildContextOptions(storeCreator({}));
    const newQuestionButton = mount(<NewQuestionButton sectionId={sectionId} />, contextOptions);
    const questionFormDialogue = mount(<QuestionFormDialogue />, contextOptions);

    // Click 'new question' button
    const newQuestionButtonNode = ReactDOM.findDOMNode(newQuestionButton.find('button').node);
    ReactTestUtils.Simulate.touchTap(newQuestionButtonNode);
    expect(questionFormDialogue.find('QuestionFormDialogue').first().props().visible).toBe(true);

    // Fill section form with title
    const questionText = 'Question: Is it true?';
    const optionText = 'Yes';
    const dialogInline = questionFormDialogue.find('RenderToLayer').first().node.layerElement;
    const questionForm = new ReactWrapper(dialogInline, true).find('form');
    const descriptionInput = questionForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: questionText } });
    const optionInput = questionForm.find('QuestionFormOption').first().find('textarea').last();
    optionInput.simulate('change', { target: { value: optionText } });

    // Submit question form
    const submitButton = questionFormDialogue.find('FormDialogue').first().node.submitButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(submitButton));

    expect(spyCreate).toHaveBeenCalled();
    const formData = spyCreate.mock.calls[0][0];
    // formData is an instance of FormData. To enumerate all the items, we should be able to use
    // `#entries` or `#keys`, but jsdom doesn't seem to support these methods yet.
    // See https://github.com/tmpvar/jsdom/issues/1671
    expect(formData.get('question[question_type]')).toBe('multiple_response');
    expect(formData.get('question[required]')).toBe('false');
    expect(formData.get('question[description]')).toBe(questionText);
    expect(formData.get('question[options_attributes][0][option]')).toBe(optionText);
  });
});
