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
  explanation: {
    id: 'course.assessment.submission.answer.explanation',
    defaultMessage: 'Explanation',
  },
  grade: {
    id: 'course.assessment.submission.answer.grade',
    defaultMessage: 'Grade',
  },
  group: {
    id: 'course.assessment.submission.answer.group',
    defaultMessage: 'Group',
  },
  point: {
    id: 'course.assessment.submission.answer.point',
    defaultMessage: 'Point',
  },
  maximumGroupGrade: {
    id: 'course.assessment.submission.answer.maximumGroupGrade',
    defaultMessage: 'Maximum Grade for this Group',
  },
  pointGrade: {
    id: 'course.assessment.submission.answer.pointGrade',
    defaultMessage: 'Grade for this Point',
  },
  compre_keyword: {
    id: 'course.assessment.submission.answer.compreKeyword',
    defaultMessage: 'Keywords',
  },
  compre_lifted_word: {
    id: 'course.assessment.submission.answer.compreLiftedWord',
    defaultMessage: 'Lifted Words',
  },
  solutionLemma: {
    id: 'course.assessment.submission.answer.solutionLemma',
    defaultMessage: 'Solution (lemma form for autograding)',
  },
});

function renderTextResponseSolutions(question) {
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
          {question.solutions.map(solution => (
            <TableRow key={solution.id}>
              <TableRowColumn>{solution.solutionType}</TableRowColumn>
              <TableRowColumn style={{ whiteSpace: 'pre-wrap' }}>{solution.solution}</TableRowColumn>
              <TableRowColumn>{solution.grade}</TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}

function renderTextResponseComprehensionPoint(point) {
  return (
    <React.Fragment>
      <br />
      <h5><FormattedMessage {...translations.point} /></h5>
      <Table selectable={false}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn><FormattedMessage {...translations.pointGrade} /></TableRowColumn>
            <TableRowColumn>{point.pointGrade}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableHeaderColumn><FormattedMessage {...translations.type} /></TableHeaderColumn>
            <TableHeaderColumn><FormattedMessage {...translations.solution} /></TableHeaderColumn>
            <TableHeaderColumn><FormattedMessage {...translations.solutionLemma} /></TableHeaderColumn>
            <TableHeaderColumn><FormattedMessage {...translations.explanation} /></TableHeaderColumn>
          </TableRow>
          {point.solutions.map(solution => (
            <TableRow key={solution.id}>
              <TableRowColumn><FormattedMessage {...translations[solution.solutionType]} /></TableRowColumn>
              <TableRowColumn style={{ whiteSpace: 'pre-wrap' }}>{solution.solution}</TableRowColumn>
              <TableRowColumn style={{ whiteSpace: 'pre-wrap' }}>{solution.solutionLemma}</TableRowColumn>
              <TableRowColumn style={{ whiteSpace: 'pre-wrap' }}>{solution.explanation}</TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}

function renderTextResponseComprehensionGroup(group) {
  return (
    <React.Fragment>
      <br />
      <h4><FormattedMessage {...translations.group} /></h4>
      <Table selectable={false}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn><FormattedMessage {...translations.maximumGroupGrade} /></TableRowColumn>
            <TableRowColumn>{group.maximumGroupGrade}</TableRowColumn>
            <TableRowColumn />
            <TableRowColumn />
          </TableRow>
          {group.points.map(point => (
            <TableRow key={point.id}>
              <TableRowColumn colSpan={4}>
                {renderTextResponseComprehensionPoint(point)}
              </TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}

function renderTextResponseComprehension(question) {
  return (
    <React.Fragment>
      <hr />
      <h4><FormattedMessage {...translations.solutions} /></h4>
      {question.groups.map(group => (
        <div key={group.id}>{renderTextResponseComprehensionGroup(group)}</div>
      ))}
    </React.Fragment>
  );
}

function solutionsTable(question) {
  if (question.comprehension && question.groups) {
    return renderTextResponseComprehension(question);
  } else if (!question.comprehension && question.solutions) {
    return renderTextResponseSolutions(question);
  }
  return null;
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
      { graderView ? solutionsTable(question) : null }
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
