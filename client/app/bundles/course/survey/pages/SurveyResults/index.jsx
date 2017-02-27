import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import TitleBar from 'lib/components/TitleBar';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import { sorts } from '../../utils';
import surveyTranslations from '../../translations';
import { fetchResults } from '../../actions/surveys';
import QuestionResults from './QuestionResults';
import { surveyShape, questionShape } from '../../propTypes';

class SurveyResults extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
      surveyId: PropTypes.string.isRequired,
    }).isRequired,
    survey: surveyShape,
    questions: PropTypes.arrayOf(questionShape),
  }

  componentDidMount() {
    const {
      dispatch,
      params: { surveyId },
    } = this.props;
    dispatch(fetchResults(surveyId));
  }

  renderResults() {
    const { questions } = this.props;
    const { byWeight } = sorts;
    return (
      <div>
        {
          questions.sort(byWeight).map((question, index) =>
            <QuestionResults
              key={question.id}
              {...{ question, index }}
            />
          )
        }
      </div>
    );
  }

  render() {
    const { survey, params: { courseId } } = this.props;
    return (
      <div>
        <TitleBar
          title={survey.title}
          iconElementLeft={<IconButton><ArrowBack /></IconButton>}
          onLeftIconButtonTouchTap={() => browserHistory.push(`/courses/${courseId}/surveys`)}
        />
        <Subheader><FormattedMessage {...surveyTranslations.questions} /></Subheader>
        {this.renderResults()}
      </div>
    );
  }
}

export default connect(state => state.results)(SurveyResults);
