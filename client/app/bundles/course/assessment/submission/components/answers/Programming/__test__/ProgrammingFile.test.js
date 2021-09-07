import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import store from 'course/assessment/submission/store';
import ProgrammingFile from '../ProgrammingFile';
import actionTypes from '../../../../constants';

const courseId = 1;
const assessmentId = 2;
const submissionId = 3;

const mockSubmission = {
  submission: {
    attemptedAt: '2017-05-11T15:38:11.000+08:00',
    basePoints: 1000,
    graderView: true,
    canUpdate: true,
    isCreator: false,
    late: false,
    maximumGrade: 70,
    pointsAwarded: null,
    submittedAt: '2017-05-11T17:02:17.000+08:00',
    submitter: 'Jane',
    workflowState: 'submitted',
  },
  assessment: {},
  annotations: [{ fileId: 1, topics: [] }],
  posts: [],
  questions: [],
  topics: [],
  answers: [],
};

describe('<ProgrammingFile />', () => {
  it('renders download link for files with null content', async () => {
    store.dispatch({
      type: actionTypes.FETCH_SUBMISSION_SUCCESS,
      payload: mockSubmission,
    });

    const programmingFileProps = {
      file: {
        id: 1,
        filename: 'template.py',
        content: null,
        highlighted_content: null,
      },
      fieldName: 'programming_answer',
      readOnly: true,
      answerId: 1,
      language: 'python',
    };

    const programmingFile = mount(
      <MemoryRouter
        initialEntries={[`/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`]}
      >
        <ProgrammingFile {...programmingFileProps} />
      </MemoryRouter>,
      buildContextOptions(store)
    );

    expect(programmingFile.find('a').length).toBe(1);
  });

  it('does not render download link for files with empty content', async () => {
    store.dispatch({
      type: actionTypes.FETCH_SUBMISSION_SUCCESS,
      payload: mockSubmission,
    });

    const programmingFileProps = {
      file: {
        id: 1,
        filename: 'template.py',
        content: '',
        highlighted_content: '',
      },
      fieldName: 'programming_answer',
      readOnly: true,
      answerId: 1,
      language: 'python',
    };

    const programmingFile = mount(
      <MemoryRouter
        initialEntries={[`/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`]}
      >
        <ProgrammingFile {...programmingFileProps} />
      </MemoryRouter>,
      buildContextOptions(store)
    );

    expect(programmingFile.find('a').length).toBe(0);
  });
});
