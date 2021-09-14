import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import storeCreator from 'course/assessment/question/scribing/store';
import ScribingQuestion from 'course/assessment/question/scribing/ScribingQuestion';

import { initialStates } from '../reducers';
import { updateScribingQuestion } from '../actions/scribingQuestionActionCreators';

// Mock axios
const client = CourseAPI.assessment.question.scribing.getClient();
const mock = new MockAdapter(client);
const store = storeCreator({ initialStates });

const assessmentId = '2';
const scribingId = '3';

const mockFields = {
  question_scribing: {
    description: '',
    maximum_grade: 10,
    skill_ids: [],
    staff_only_comments: '',
    title: 'Scribing Exercise',
  },
};

const mockUpdatedFields = {
  question_scribing: {
    description: '',
    maximum_grade: 10,
    question_assessment: { skill_ids: [''] },
    staff_only_comments: '',
    title: 'Scribing Exercise',
  },
};

beforeEach(() => {
  mock.reset();
});

describe('Scribing question', () => {
  it('renders new question form', async () => {
    window.history.pushState(
      {},
      '',
      `/courses/${courseId}/assessments/${assessmentId}/question/scribing/new`
    );

    // Mock assessment axios
    const assessmentsClient = CourseAPI.assessment.assessments.getClient();
    const assessmentsMock = new MockAdapter(assessmentsClient);

    assessmentsMock
      .onGet(`/courses/${courseId}/assessments/skills`)
      .reply(200, {
        skills: [
          {
            id: 487,
            title: 'Multiple',
          },
          {
            id: 486,
            title: 'Test',
          },
        ],
      });

    const spyFetchSkills = jest.spyOn(
      CourseAPI.assessment.assessments,
      'fetchSkills'
    );

    const newPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[
            `/courses/${courseId}/assessments/${assessmentId}/question/scribing/new`,
          ]}
        >
          <ScribingQuestion />
        </MemoryRouter>
      </ProviderWrapper>
    );

    // Wait for api call
    await sleep(1);
    expect(spyFetchSkills).toHaveBeenCalled();
    newPage.update();
    expect(newPage.find('InputField').length).toBe(2);
    expect(newPage.find('MultiSelectSkillsField').length).toBe(1);
    expect(newPage.find('SummernoteField').length).toBe(2);
    expect(newPage.find('FileUploadField').length).toBe(1);
    expect(
      newPage.find('[htmlFor="question_scribing_attachment"]').length
    ).toBe(0);
  });

  it('renders edit question form', async () => {
    const editUrl = `/courses/${courseId}/assessments/${assessmentId}/question/scribing/${scribingId}/edit`;
    window.history.pushState({}, '', editUrl);

    mock
      .onGet(
        `/courses/${courseId}/assessments/${assessmentId}/question/scribing/${scribingId}`
      )
      .reply(200, {
        question: {
          id: 59,
          title: 'Scribing Exercise',
          description: '',
          staff_only_comments: '',
          maximum_grade: '10.0',
          weight: 6,
          attachment_reference: {
            name: 'floor-plan-grid.png',
            path: 'uploads/attachments/floor-plan-grid.png',
            updater_name: 'Jane Doe',
          },
          skill_ids: [],
          skills: [
            {
              id: 487,
              title: 'Multiple',
            },
            {
              id: 486,
              title: 'Test',
            },
          ],
          published_assessment: true,
        },
      });

    const spyFetch = jest.spyOn(
      CourseAPI.assessment.question.scribing,
      'fetch'
    );

    const fetchPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[
            `/courses/${courseId}/assessments/${assessmentId}/question
                            /scribing/${scribingId}/edit`,
          ]}
        >
          <ScribingQuestion />
        </MemoryRouter>
      </ProviderWrapper>
    );

    // Wait for api call
    await sleep(1);
    expect(spyFetch).toHaveBeenCalled();
    fetchPage.update();
    expect(fetchPage.find('InputField').length).toBe(2);
    expect(fetchPage.find('MultiSelectSkillsField').length).toBe(1);
    expect(fetchPage.find('SummernoteField').length).toBe(2);
    expect(fetchPage.find('FileUploadField').length).toBe(0);
    expect(
      fetchPage.find('[htmlFor="question_scribing_attachment"]').length
    ).toBe(1);
  });

  it('renders error message when submit fails from server', async () => {
    const editUrl = `/courses/${courseId}/assessments/${assessmentId}/question/scribing/${scribingId}/edit`;
    window.history.pushState({}, '', editUrl);

    mock
      .onPatch(
        `/courses/${courseId}/assessments/${assessmentId}/question/scribing/${scribingId}`
      )
      .reply(400, {
        errors: ["Maximum grade can't be blank"],
      });

    const spyUpdate = jest.spyOn(
      CourseAPI.assessment.question.scribing,
      'update'
    );

    const fetchPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[
            `/courses/${courseId}/assessments/${assessmentId}/question
                            /scribing/${scribingId}/edit`,
          ]}
        >
          <ScribingQuestion />
        </MemoryRouter>
      </ProviderWrapper>
    );

    store.dispatch(updateScribingQuestion(scribingId, mockFields));
    // Wait for api call
    await sleep(1);
    expect(spyUpdate).toHaveBeenCalled();
    fetchPage.update();
    expect(fetchPage.find('div.alert').length).toBe(1);
  });

  it('allows question to be created', async () => {
    window.history.pushState(
      {},
      '',
      `/courses/${courseId}/assessments/${assessmentId}/question/scribing/new`
    );

    const spyCreate = jest.spyOn(
      CourseAPI.assessment.question.scribing,
      'create'
    );

    const postUrl = `/courses/${courseId}/assessments/${assessmentId}/question/scribing/`;
    mock.onPost(postUrl).reply(200, {});

    const newPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[
            `/courses/${courseId}/assessments/${assessmentId}/question/scribing/new`,
          ]}
        >
          <ScribingQuestion />
        </MemoryRouter>
      </ProviderWrapper>
    );

    await sleep(1);
    newPage.update();
    newPage.find('button').first().simulate('submit');

    await sleep(1);
    expect(spyCreate).toHaveBeenCalled();
  });

  it('allows question to be updated', async () => {
    window.history.pushState(
      {},
      '',
      `/courses/${courseId}/assessments/${assessmentId}/question/scribing/edit`
    );

    const spyUpdate = jest.spyOn(
      CourseAPI.assessment.question.scribing,
      'update'
    );

    const patchUrl = `/courses/${courseId}/assessments/${assessmentId}/question/scribing/${scribingId}`;
    mock.onPatch(patchUrl).reply(200, {});

    const fetchPage = mount(
      <ProviderWrapper store={store}>
        <MemoryRouter
          initialEntries={[
            `/courses/${courseId}/assessments/${assessmentId}
                            /question/scribing/${scribingId}/edit`,
          ]}
        >
          <ScribingQuestion />
        </MemoryRouter>
      </ProviderWrapper>
    );

    await sleep(1);
    fetchPage.update();
    fetchPage.find('button').first().simulate('submit');

    await sleep(1);
    expect(spyUpdate).toHaveBeenCalledWith(scribingId, mockUpdatedFields);
  });
});
