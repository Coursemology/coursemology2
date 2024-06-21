import { useRef } from 'react';
import { dispatch } from 'store';
import { render } from 'test-utils';

import actionTypes from '../../../../constants';
import ProgrammingFile from '../ProgrammingFile';

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
    dispatch({
      type: actionTypes.FETCH_SUBMISSION_SUCCESS,
      payload: mockSubmission,
    });

    const programmingFileProps = {
      answerId: 1,
      fieldName: 'programming_answer',
      file: {
        id: 1,
        filename: 'template.py',
        content: '',
        highlightedContent: null,
      },
      language: 'python',
      readOnly: true,
      editorRef: useRef(null),
      saveAnswerAndUpdateClientVersion: (_answerId: number): void => {},
      onCursorChange: (): void => {},
    };

    const url = `/courses/${courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;
    const page = render(<ProgrammingFile {...programmingFileProps} />, {
      at: [url],
    });

    expect(page.getByText('file is too big', { exact: false })).toBeVisible();
  });
});
