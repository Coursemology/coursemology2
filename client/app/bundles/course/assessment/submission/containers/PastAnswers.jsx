import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import { yellow100 } from 'material-ui/styles/colors';

import selectPastAnswers from '../actions/history';
import translations from '../translations';
import { answerShape, questionShape } from '../propTypes';
import { formatDateTime } from '../utils';
import PastProgrammingAnswer from '../components/pastAnswers/PastProgrammingAnswer';
import PastMultipleResponseAnswer from '../components/pastAnswers/PastMultipleResponseAnswer';
import TextResponseSolutions from '../components/TextResponseSolutions';
import { questionTypes } from '../constants';

const styles = {
  horizontalRule: {
    marginTop: 40,
    marginBottom: 40,
  },
};

class PastAnswers extends Component {
  constructor(props) {
    super(props);

    this.renderReadOnlyPastAnswer = this.renderReadOnlyPastAnswer.bind(this);
  }

  getAnswersHistory(question, answer) {
    const { intl } = this.props;
    switch (question.type) {
      case questionTypes.Programming:
        return <PastProgrammingAnswer question={question} answer={answer} />;
      case questionTypes.MultipleChoice:
      case questionTypes.MultipleResponse:
        return (
          <PastMultipleResponseAnswer question={question} answer={answer} />
        );
      case questionTypes.Comprehension:
      case questionTypes.TextResponse:
        return <div dangerouslySetInnerHTML={{ __html: answer.answer_text }} />;
      default:
        return (
          <Card style={{ backgroundColor: yellow100 }}>
            <CardText>
              <span>
                {intl.formatMessage(translations.rendererNotImplemented)}
              </span>
            </CardText>
          </Card>
        );
    }
  }

  renderReadOnlyPastAnswer(answerId) {
    const { answers, intl, question } = this.props;
    const answer = answers[answerId];
    const date = formatDateTime(answer.createdAt);

    return (
      <div key={answer.id}>
        <h4>
          {intl.formatMessage(translations.submittedAt)}: {date}
        </h4>
        {this.getAnswersHistory(question, answer)}
        <hr style={styles.horizontalRule} />
      </div>
    );
  }

  renderSelectedPastAnswers(selectedAnswerIds) {
    if (selectedAnswerIds.length > 0) {
      return selectedAnswerIds.map(this.renderReadOnlyPastAnswer);
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
    const {
      answers,
      answerIds,
      selectedAnswerIds,
      handleSelectPastAnswers,
      intl,
    } = this.props;
    const selectedAnswers = selectedAnswerIds.map(
      (answerId) => answers[answerId],
    );

    const renderOption = (answerId, index) => {
      const answer = answers[answerId];
      return (
        <MenuItem
          key={index}
          insetChildren
          checked={selectedAnswerIds.indexOf(answerId) > -1}
          value={answer}
          primaryText={formatDateTime(answer.createdAt)}
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
    const { selectedAnswerIds, question, graderView } = this.props;
    const { TextResponse, Comprehension } = questionTypes;

    return (
      <div>
        <div style={{ width: '100%', display: 'inline-block' }}>
          {this.renderPastAnswerSelect()}
        </div>
        {this.renderSelectedPastAnswers(selectedAnswerIds)}
        {[TextResponse, Comprehension].includes(question.type) &&
          graderView && <TextResponseSolutions question={question} />}
      </div>
    );
  }
}

PastAnswers.propTypes = {
  intl: intlShape.isRequired,
  selectedAnswerIds: PropTypes.arrayOf(PropTypes.number),
  answerIds: PropTypes.arrayOf(PropTypes.number),
  answers: PropTypes.objectOf(answerShape),
  question: questionShape,
  handleSelectPastAnswers: PropTypes.func,
  graderView: PropTypes.bool,
};

function mapStateToProps(state, ownProps) {
  const { question } = ownProps;
  const selectedAnswerIds = state.history.questions[question.id].selected;
  const answerIds = state.history.questions[question.id].answerIds;
  const answers = state.history.answers;
  const graderView = state.submission.graderView;

  return {
    selectedAnswerIds,
    answerIds,
    answers,
    question,
    graderView,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { question } = ownProps;
  return {
    handleSelectPastAnswers: (event, index, answers) =>
      dispatch(selectPastAnswers(question.id, answers)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(PastAnswers));
