/* eslint-disable new-cap */
import React from 'react';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import TestBackend from 'react-dnd-test-backend';
import { DragDropContext } from 'react-dnd';
import storeCreator from 'course/survey/store';
import { ConnectedSurveyShow } from '../index';

// Mock axios
const client = CourseAPI.survey.surveys.getClient();
const mock = new MockAdapter(client);

const surveyData = {
  id: 1,
  title: 'Test survey',
  isStarted: true,
  responseId: 1,
  submitted_at: new Date('2017-03-26'),
  canUpdate: true,
  canDelete: true,
  canCreateSection: true,
  canViewResults: true,
  sections: [{
    id: 18,
    weight: 1,
    title: 'Second Section',
    questions: [],
  }, {
    id: 19,
    weight: 0,
    title: 'First Section',
    questions: [{
      id: 1,
      weight: 1,
      section_id: 19,
      description: 'Q2',
      question_type: 'multiple_response',
      grid_view: false,
      canUpdate: false,
      canDelete: false,
      options: [{ id: 2, option: 'Accept?', weight: 0 }],
    }, {
      id: 2,
      weight: 0,
      section_id: 19,
      description: 'Q1',
      question_type: 'multiple_choice',
      grid_view: true,
      canUpdate: true,
      canDelete: true,
      options: [{ id: 1, option: 'No choice', weight: 0 }],
    }],
  }],
};

const contextOptions = store => ({
  context: { intl, store, muiTheme },
  childContextTypes: {
    muiTheme: React.PropTypes.object,
    store: React.PropTypes.object,
    intl: intlShape,
  },
});

/**
 * Wraps a component into a DragDropContext that uses the TestBackend.
 */
function wrapInTestContext(DecoratedComponent) {
  const TestContextContainer = props => <DecoratedComponent {...props} />;
  return DragDropContext(TestBackend)(TestContextContainer);
}

beforeEach(() => {
  mock.reset();
});

describe('<SurveyShow />', () => {
  it('allows questions to be re-ordered', async () => {
    // Set up mock and spies
    const surveyUrl = `/courses/${courseId}/surveys/${surveyData.id}`;
    mock.onGet(surveyUrl).reply(200, surveyData);
    const spyFetch = jest.spyOn(CourseAPI.survey.surveys, 'fetch');
    const spyFinalizeOrder = jest.spyOn(CourseAPI.survey.surveys, 'reorderQuestions');

    // Mount showPage and wait for survey data to load
    Object.defineProperty(window.location, 'pathname', { value: surveyUrl });
    const store = storeCreator({ surveys: {} });
    const WrappedSurveyShow = wrapInTestContext(ConnectedSurveyShow);
    const showPage = mount(
      <WrappedSurveyShow params={{ courseId, surveyId: surveyData.id.toString() }} />,
      contextOptions(store)
    );
    await sleep(1);
    expect(spyFetch).toHaveBeenCalled();

    const sections = showPage.find('DropTarget(Section)');
    const questions = showPage.find('DropTarget(DragSource(Question))');
    const sourceQuestion = questions.first();
    const targetQuestion = questions.last();

    // Mock getBoundingClientRect for question drop target
    const targetQuestionDOMNode =
      targetQuestion.node.getDecoratedComponentInstance().getDecoratedComponentInstance().DOMNode;
    targetQuestionDOMNode.getBoundingClientRect = jest.fn();
    targetQuestionDOMNode.getBoundingClientRect
      .mockReturnValue({ bottom: 200, height: 100, left: 0, right: 0, top: 100, width: 0 });

    // Simulate dragging first question down past the mid-line of the second question
    const dragDropBackend = showPage.node.getManager().getBackend();
    const sourceQuestionHandlerId =
      sourceQuestion.node.getDecoratedComponentInstance().getHandlerId();
    const targetQuestionHandlerId = targetQuestion.node.getHandlerId();
    const questionWeights =
      () => sections.first().props().section.questions.map(question => question.weight);
    const questionWeightsBeforeReorder = questionWeights();
    dragDropBackend.simulateBeginDrag([sourceQuestionHandlerId], {
      clientOffset: { x: 0, y: 175 },
      getSourceClientOffset: () => ({ x: 0, y: 0 }),
    });
    dragDropBackend.simulateHover([targetQuestionHandlerId], { clientOffset: { x: 0, y: 175 } });
    const questionWeightsAfterReorder = questionWeights();
    expect(questionWeightsBeforeReorder[0]).toBeLessThan(questionWeightsBeforeReorder[1]);
    expect(questionWeightsAfterReorder[0]).not.toBeLessThan(questionWeightsAfterReorder[1]);

    // Mock getBoundingClientRect for section drop target
    const tragetSection = sections.last();
    const targetSectionDOMNode = tragetSection.node.getDecoratedComponentInstance().DOMNode;
    targetSectionDOMNode.getBoundingClientRect = jest.fn();
    targetSectionDOMNode.getBoundingClientRect
      .mockReturnValue({ bottom: 400, height: 100, left: 0, right: 0, top: 300, width: 0 });

    // Continue dragging question down into the next section
    const targetSectionHandlerId = tragetSection.node.getHandlerId();
    expect(sections.first().props().section.questions.length).toBe(2);
    expect(sections.last().props().section.questions.length).toBe(0);
    dragDropBackend.simulateHover([], { clientOffset: { x: 0, y: 350 } });
    dragDropBackend.simulateHover([targetSectionHandlerId]);
    expect(sections.first().props().section.questions.length).toBe(1);
    expect(sections.last().props().section.questions.length).toBe(1);

    // Ordering should be saved on end drag
    dragDropBackend.simulateEndDrag();
    expect(spyFinalizeOrder).toHaveBeenCalledWith({ ordering: [[19, [1]], [18, [2]]] });
  });
});
