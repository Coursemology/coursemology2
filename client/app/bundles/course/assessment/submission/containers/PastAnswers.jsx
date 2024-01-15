import { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import { formatLongDateTime } from 'lib/moment';

import selectPastAnswers from '../actions/history';
import PastMultipleResponseAnswer from '../components/pastAnswers/PastMultipleResponseAnswer';
import PastProgrammingAnswer from '../components/pastAnswers/PastProgrammingAnswer';
import TextResponseSolutions from '../components/TextResponseSolutions';
import { questionTypes } from '../constants';
import { answerShape, questionShape } from '../propTypes';
import translations from '../translations';

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
        return (
          <Typography
            dangerouslySetInnerHTML={{ __html: answer.answer_text }}
            variant="body2"
          />
        );
      default:
        return (
          <Card className="bg-yellow-100">
            <CardContent>
              <Typography variant="body2">
                {intl.formatMessage(translations.rendererNotImplemented)}
              </Typography>
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
          {formatLongDateTime(answer.createdAt)}
          {answer.isDraftAnswer && (
            <>&nbsp;{intl.formatMessage(translations.draftAnswer)}</>
          )}
        </MenuItem>
      );
    };

    return (
      <FormControl style={{ float: 'right', width: 300 }} variant="standard">
        <InputLabel>{intl.formatMessage(translations.pastAnswers)}</InputLabel>
        <Select
          multiple
          onChange={handleSelectPastAnswers}
          value={selectedAnswers || 'test'}
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
    const date = formatLongDateTime(answer.createdAt);

    return (
      <div key={answer.id}>
        <Typography variant="h6">
          {answer.isDraftAnswer
            ? intl.formatMessage(translations.savedAt)
            : intl.formatMessage(translations.submittedAt)}
          : {date}
        </Typography>
        {this.getAnswersHistory(question, answer)}
        <hr />
      </div>
    );
  };

  renderSelectedPastAnswers(selectedAnswerIds) {
    const { intl } = this.props;
    if (selectedAnswerIds.length > 0) {
      return selectedAnswerIds.map(this.renderReadOnlyPastAnswer);
    }
    return (
      <Card className="bg-yellow-100">
        <CardContent>
          <Typography variant="body2">
            {intl.formatMessage(translations.noAnswerSelected)}
          </Typography>
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
  intl: PropTypes.object.isRequired,
  selectedAnswerIds: PropTypes.arrayOf(PropTypes.number),
  answerIds: PropTypes.arrayOf(PropTypes.number),
  answers: PropTypes.objectOf(answerShape),
  question: questionShape,
  handleSelectPastAnswers: PropTypes.func,
  graderView: PropTypes.bool,
};

function mapStateToProps({ assessments: { submission } }, ownProps) {
  const { question } = ownProps;
  const selectedAnswerIds = submission.history.questions[question.id].selected;
  const answerIds = submission.history.questions[question.id].answerIds;
  const answers = submission.history.answers;
  const graderView = submission.submission.graderView;

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
