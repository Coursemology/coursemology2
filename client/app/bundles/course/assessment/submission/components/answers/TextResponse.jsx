import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import RichTextField from 'lib/components/redux-form/RichTextField';
import { Table, TableBody, TableHeader, TableHeaderColumn,
  TableRow, TableRowColumn } from 'material-ui/Table';

import { questionShape } from '../../propTypes';
import UploadedFileView from '../../containers/UploadedFileView';
import FileInput from '../FileInput';

const translations = defineMessages({
  solutions: {
    id: 'course.assessment.submission.answer.solutions',
    defaultMessage: 'Solutions',
  },
  type: {
    id: 'course.assessment.submission.answer.type',
    defaultMessage: 'Type',
  },
  solution: {
    id: 'course.assessment.submission.answer.solution',
    defaultMessage: 'Solution',
  },
  grade: {
    id: 'course.assessment.submission.answer.grade',
    defaultMessage: 'Grade',
  },
});

function renderTextResponseSolutions(question) {
  /* eslint-disable react/no-array-index-key */
  return (
    <React.Fragment>
      <hr />
      <h4><FormattedMessage {...translations.solutions} /></h4>
      <Table selectable={false}>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn><FormattedMessage {...translations.type} /></TableHeaderColumn>
            <TableHeaderColumn><FormattedMessage {...translations.solution} /></TableHeaderColumn>
            <TableHeaderColumn><FormattedMessage {...translations.grade} /></TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {question.solutions.map((solution, index) => (
            <TableRow key={index}>
              <TableRowColumn>{solution.solutionType}</TableRowColumn>
              <TableRowColumn style={{ whiteSpace: 'pre-wrap' }}>{solution.solution}</TableRowColumn>
              <TableRowColumn>{solution.grade}</TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
  /* eslint-enable react/no-array-index-key */
}

function TextResponse({ question, readOnly, answerId, graderView }) {
  const allowUpload = question.allowAttachment;

  const readOnlyAnswer = (<Field
    name={`${answerId}[answer_text]`}
    component={props =>
      <div dangerouslySetInnerHTML={{ __html: props.input.value }} />} // eslint-disable-line react/prop-types
  />);

  const richtextAnswer = (<Field
    name={`${answerId}[answer_text]`}
    component={RichTextField}
    multiLine
  />);

  const plaintextAnswer = (<Field
    name={`${answerId}[answer_text]`}
    component="textarea"
    style={{ width: '100%' }}
    rows={5}
  />);

  const editableAnswer = question.autogradable ? plaintextAnswer : richtextAnswer;

  return (
    <div>
      { readOnly ? readOnlyAnswer : editableAnswer }
      {question.solutions && graderView ? renderTextResponseSolutions(question) : null}
      {allowUpload ? <UploadedFileView questionId={question.id} /> : null}
      {allowUpload && !readOnly ? <FileInput name={`${answerId}[files]`} disabled={readOnly} /> : null}
    </div>
  );
}

TextResponse.propTypes = {
  question: questionShape,
  readOnly: PropTypes.bool,
  answerId: PropTypes.number,
  graderView: PropTypes.bool,
};

export default TextResponse;
