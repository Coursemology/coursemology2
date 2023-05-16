import MockAdapter from 'axios-mock-adapter';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import ScribingQuestion from 'course/assessment/question/scribing/ScribingQuestion';

const mock = new MockAdapter(CourseAPI.assessment.question.scribing.client);
const assessmentsMock = new MockAdapter(
  CourseAPI.assessment.assessments.client,
);

const assessmentId = '2';
const scribingId = '3';

const mockUpdatedFields = {
  question_scribing: {
    description: '',
    maximum_grade: 10,
    question_assessment: { skill_ids: [''] },
    staff_only_comments: '',
    title: 'Scribing Exercise',
  },
};

const mockSkills = {
  skills: [
    { id: 487, title: 'Multiple' },
    { id: 486, title: 'Test' },
  ],
};

const mockEditData = {
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
      { id: 487, title: 'Multiple' },
      { id: 486, title: 'Test' },
    ],
    published_assessment: true,
  },
};

const mockErrors = {
  errors: [{ name: 'grade', error: "Maximum grade can't be blank" }],
};

beforeEach(() => {
  mock.reset();

  assessmentsMock
    .onGet(`/courses/${global.courseId}/assessments/skills`)
    .reply(200, mockSkills);
});

describe('Scribing question', () => {
  it('renders new question form', async () => {
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/question/scribing/new`;
    window.history.pushState({}, '', url);

    const spy = jest.spyOn(CourseAPI.assessment.assessments, 'fetchSkills');

    const page = render(<ScribingQuestion />, { at: [url] });
    await waitFor(() => expect(spy).toHaveBeenCalled());

    expect(page.getByLabelText('Title')).toBeVisible();
    expect(page.getByLabelText('Description')).toBeVisible();
    expect(page.getByLabelText('Staff only comments')).toBeVisible();
    expect(page.getByLabelText('Skills')).toBeVisible();
    expect(page.getByLabelText('Maximum Grade *')).toBeVisible();

    expect(
      page.getByText('Drag your file here, or click to select file'),
    ).toBeVisible();
  });

  it('renders edit question form', async () => {
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/question/scribing/${scribingId}`;
    window.history.pushState({}, '', `${url}/edit`);

    mock.onGet(url).reply(200, mockEditData);
    const spy = jest.spyOn(CourseAPI.assessment.question.scribing, 'fetch');

    const page = render(<ScribingQuestion />, { at: [`${url}/edit`] });
    await waitFor(() => expect(spy).toHaveBeenCalled());

    expect(page.getByLabelText('Title')).toBeVisible();
    expect(page.getByLabelText('Description')).toBeVisible();
    expect(page.getByLabelText('Staff only comments')).toBeVisible();
    expect(page.getByLabelText('Skills')).toBeVisible();
    expect(
      page.getByLabelText('Maximum grade', { exact: false }),
    ).toBeVisible();

    expect(page.getByDisplayValue(mockEditData.question.title)).toBeVisible();
    expect(page.getByDisplayValue(10)).toBeVisible();
  });

  it('renders error message when submit fails from server', async () => {
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/question/scribing/${scribingId}`;
    window.history.pushState({}, '', `${url}/edit`);

    mock.onPatch(url).reply(400, mockErrors);
    const spy = jest.spyOn(CourseAPI.assessment.question.scribing, 'update');

    const page = render(<ScribingQuestion />, { at: [`${url}/edit`] });

    await waitFor(() => {
      expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
      fireEvent.click(page.getByRole('button', { name: 'Submit' }));
    });

    await waitFor(() => expect(spy).toHaveBeenCalled());

    expect(
      page.getByText('Failed submitting this form. Please try again.'),
    ).toBeVisible();
  });

  it('allows question to be created', async () => {
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/question/scribing`;
    window.history.pushState({}, '', `${url}/new`);

    const spy = jest.spyOn(CourseAPI.assessment.question.scribing, 'create');
    mock.onPost(url).reply(200, {});

    const page = render(<ScribingQuestion />, { at: [`${url}/new`] });

    await waitFor(() => {
      expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
      fireEvent.click(page.getByRole('button', { name: 'Submit' }));
    });

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  it('allows question to be updated', async () => {
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/question/scribing/${scribingId}`;
    window.history.pushState({}, '', `${url}/edit`);

    const spy = jest.spyOn(CourseAPI.assessment.question.scribing, 'update');
    mock.onPatch(url).reply(200, {});

    const page = render(<ScribingQuestion />, { at: [`${url}/edit`] });

    await waitFor(() => {
      expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
      fireEvent.click(page.getByRole('button', { name: 'Submit' }));
    });

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(scribingId, mockUpdatedFields),
    );
  });
});
