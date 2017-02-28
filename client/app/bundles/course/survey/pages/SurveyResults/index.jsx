import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import TitleBar from 'lib/components/TitleBar';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import Toggle from 'material-ui/Toggle';
import { Card, CardText } from 'material-ui/Card';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import { sorts } from '../../utils';
import surveyTranslations from '../../translations';
import { fetchResults } from '../../actions/surveys';
import QuestionResults from './QuestionResults';
import { surveyShape, questionShape } from '../../propTypes';

const translations = defineMessages({
  includePhantoms: {
    id: 'course.surveys.SurveyResults.includePhantoms',
    defaultMessage: 'Include Phantom Students',
  },
});

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

  constructor(props) {
    super(props);
    this.state = { includePhantoms: false };
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
              includePhantoms={this.state.includePhantoms}
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
        <Card>
          <CardText>
            <Toggle
              label={<FormattedMessage {...translations.includePhantoms} />}
              labelPosition="right"
              onToggle={(_, value) => this.setState({ includePhantoms: value })}
            />
          </CardText>
        </Card>
        <Subheader><FormattedMessage {...surveyTranslations.questions} /></Subheader>
        {this.renderResults()}
      </div>
    );
  }
}

export default connect(state => state.results)(SurveyResults);
