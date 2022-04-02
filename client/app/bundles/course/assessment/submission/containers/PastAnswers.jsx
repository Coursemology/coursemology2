import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { yellow } from '@mui/material/colors';

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
    marginTop: 20,
    marginBottom: 20,
  },
};

class PastAnswers extends Component {
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
          <Card style={{ backgroundColor: yellow[100] }}>
            <CardContent>
              <span>
                {intl.formatMessage(translations.rendererNotImplemented)}
              </span>
            </CardContent>
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
        <MenuItem key={index} value={answer}>
          {formatDateTime(answer.createdAt)}
        </MenuItem>
      );
    };

    return (
      <FormControl style={{ float: 'right', width: 300 }} variant="standard">
        <InputLabel>{intl.formatMessage(translations.pastAnswers)}</InputLabel>
        <Select
          multiple
          value={selectedAnswers || 'test'}
          onChange={handleSelectPastAnswers}
          variant="standard"
        >
          {answerIds.map(renderOption)}
        </Select>
      </FormControl>
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
      <Card style={{ backgroundColor: yellow[100] }}>
        <CardContent>
          <FormattedMessage {...translations.noAnswerSelected} />
        </CardContent>
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
    handleSelectPastAnswers: (event) =>
      dispatch(selectPastAnswers(question.id, event.target.value)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(PastAnswers));
