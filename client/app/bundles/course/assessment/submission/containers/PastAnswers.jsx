import { Component } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { Card, CardText } from 'material-ui/Card';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import { yellow100 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

import selectPastAnswers from '../actions/history';
import PastMultipleResponseAnswer from '../components/pastAnswers/PastMultipleResponseAnswer';
import PastProgrammingAnswer from '../components/pastAnswers/PastProgrammingAnswer';
import TextResponseSolutions from '../components/TextResponseSolutions';
import { questionTypes } from '../constants';
import { answerShape, questionShape } from '../propTypes';
import translations from '../translations';
import { formatDateTime } from '../utils';

const styles = {
  horizontalRule: {
    marginTop: 40,
    marginBottom: 40,
  },
};

class PastAnswers extends Component {
  getAnswersHistory(question, answer) {
    const { intl } = this.props;
    switch (question.type) {
      case questionTypes.Programming:
        return <PastProgrammingAnswer answer={answer} question={question} />;
      case questionTypes.MultipleChoice:
      case questionTypes.MultipleResponse:
        return (
          <PastMultipleResponseAnswer answer={answer} question={question} />
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
          checked={selectedAnswerIds.indexOf(answerId) > -1}
          insetChildren={true}
          primaryText={formatDateTime(answer.createdAt)}
          value={answer}
        />
      );
    };

    return (
      <SelectField
        floatingLabelText={intl.formatMessage(translations.pastAnswers)}
        multiple={true}
        onChange={handleSelectPastAnswers}
        style={{ float: 'right' }}
        value={selectedAnswers}
      >
        {answerIds.map(renderOption)}
      </SelectField>
    );
  }

  renderReadOnlyPastAnswer = (answerId) => {
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
  };

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
