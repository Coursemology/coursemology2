import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import { yellow100 } from 'material-ui/styles/colors';

import ProgrammingImportEditor from './ProgrammingImportEditor';
import ReadOnlyEditor from './ReadOnlyEditor';
import TestCaseView from './TestCaseView';
import { selectPastAnswers } from '../actions/history';
import translations from '../translations';
import { answerShape, questionShape } from '../propTypes';
import { formatDateTime } from '../utils';

const styles = {
  horizontalRule: {
    marginTop: 40,
    marginBottom: 40,
  },
};

class ProgrammingAnswerHistory extends Component {
  constructor(props) {
    super(props);

    this.renderPastAnswer = this.renderPastAnswer.bind(this);
  }

  renderReadOnlyPastAnswer(answerId) {
    const { answers, intl } = this.props;
    const answer = answers[answerId];
    const file = answer.files_attributes.length > 0 ? answer.files_attributes[0] : null;
    const content = file ? file.content.split('\n') : '';
    const date = formatDateTime(answer.createdAt);
    if (!file) {
      return null;
    }
    return (
      <div key={answer.id}>
        <h4>
          {intl.formatMessage(translations.submittedAt)}
:
          {' '}
          {date}
        </h4>
        <ReadOnlyEditor
          answerId={answer.id}
          fileId={file.id}
          content={content}
        />
        <TestCaseView answerId={answer.id} viewHistory />
        <hr style={styles.horizontalRule} />
      </div>
    );
  }

  renderFileSubmissionPastAnswer(answerId, question) {
    const { answers, intl } = this.props;
    const answer = answers[answerId];
    const date = formatDateTime(answer.createdAt);
    return (
      <div key={answer.id}>
        <h4>
          {intl.formatMessage(translations.submittedAt)}
:
          {' '}
          {date}
        </h4>
        <ProgrammingImportEditor
          questionId={answer.questionId}
          answerId={answer.id}
          viewHistory
          {...{
            question,
          }}
        />
        <TestCaseView answerId={answer.id} viewHistory />
        <hr style={styles.horizontalRule} />
      </div>
    );
  }

  renderPastAnswer(answerId) {
    const { question } = this.props;
    if (question.fileSubmission) {
      return this.renderFileSubmissionPastAnswer(answerId, question);
    }
    return this.renderReadOnlyPastAnswer(answerId);
  }

  renderSelectedPastAnswers(selectedAnswerIds) {
    if (selectedAnswerIds.length > 0) {
      return selectedAnswerIds.map(this.renderPastAnswer);
    }
    return (
      <Card style={{ backgroundColor: yellow100 }}>
        <CardText>
          <FormattedMessage {...translations.noAnswerSelected} />
        </CardText>
      </Card>
    );
  }

  renderPastAnswerSelect() {
    const { answers, answerIds, selectedAnswerIds, handleSelectPastAnswers, intl } = this.props;
    const selectedAnswers = selectedAnswerIds.map(answerId => answers[answerId]);

    const renderOption = (answerId, index) => {
      const answer = answers[answerId];
      const checked = selectedAnswerIds.indexOf(answerId) > -1;
      const date = formatDateTime(answer.createdAt);
      return (
        <MenuItem
          key={index}
          insetChildren
          checked={checked}
          value={answer}
          primaryText={date}
        />
      );
    };

    return (
      <SelectField
        floatingLabelText={intl.formatMessage(translations.pastAnswers)}
        multiple
        value={selectedAnswers}
        onChange={handleSelectPastAnswers}
        style={{ float: 'right' }}
      >
        {answerIds.map(renderOption)}
      </SelectField>
    );
  }

  render() {
    const { selectedAnswerIds } = this.props;

    return (
      <div>
        <div style={{ width: '100%', display: 'inline-block' }}>
          {this.renderPastAnswerSelect()}
        </div>
        {this.renderSelectedPastAnswers(selectedAnswerIds)}
      </div>
    );
  }
}

ProgrammingAnswerHistory.propTypes = {
  intl: intlShape.isRequired,
  selectedAnswerIds: PropTypes.arrayOf(PropTypes.number),
  answerIds: PropTypes.arrayOf(PropTypes.number),
  answers: PropTypes.objectOf(answerShape),
  question: questionShape,
  handleSelectPastAnswers: PropTypes.func,
};

function mapStateToProps(state, ownProps) {
  const { question } = ownProps;
  const selectedAnswerIds = state.history.questions[question.id].selected;
  const answerIds = state.history.questions[question.id].answerIds;
  const answers = state.history.answers;

  return {
    selectedAnswerIds,
    answerIds,
    answers,
    question,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { question } = ownProps;
  return {
    handleSelectPastAnswers: (event, index, answers) => dispatch(selectPastAnswers(question.id, answers)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ProgrammingAnswerHistory));
