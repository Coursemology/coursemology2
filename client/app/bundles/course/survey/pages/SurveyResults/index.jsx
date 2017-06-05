import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import Toggle from 'material-ui/Toggle';
import { Card, CardText } from 'material-ui/Card';
import surveyTranslations from 'course/survey/translations';
import { fetchResults } from 'course/survey/actions/surveys';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { surveyShape, sectionShape } from 'course/survey/propTypes';
import ResultsSection from './ResultsSection';

const translations = defineMessages({
  includePhantoms: {
    id: 'course.surveys.SurveyResults.includePhantoms',
    defaultMessage: 'Include Phantom Students',
  },
  responsesCount: {
    id: 'course.surveys.SurveyResults.responsesCount',
    defaultMessage: 'Number of Responses: {count}',
  },
  noSections: {
    id: 'course.surveys.SurveyResults.noSections',
    defaultMessage: 'This survey does not have any questions yet.',
  },
  noPhantoms: {
    id: 'course.surveys.SurveyResults.noPhantoms',
    defaultMessage: 'No phantom student responses.',
  },
});

class SurveyResults extends React.Component {
  static propTypes = {
    survey: surveyShape,
    surveyId: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    sections: PropTypes.arrayOf(sectionShape),
  }

  constructor(props) {
    super(props);
    this.state = { includePhantoms: true };
  }

  componentDidMount() {
    const { dispatch, surveyId } = this.props;
    dispatch(fetchResults(surveyId));
  }

  getRespondentsCount() {
    const { sections } = this.props;
    if (
      (sections && sections.length) < 1 ||
      (sections[0].questions && sections[0].questions.length < 1) ||
      (sections[0].questions[0].answers && sections[0].questions[0].answers.length < 1)
    ) {
      return { totalStudents: 0, realStudents: 0 };
    }

    const totalStudents = sections[0].questions[0].answers.length;
    const realStudents =
      sections[0].questions[0].answers.filter(answer => !answer.phantom).length;
    return { totalStudents, realStudents };
  }

  render() {
    const { sections, isLoading, survey: { anonymous } } = this.props;
    const noSections = sections && sections.length < 1;
    if (isLoading) { return <LoadingIndicator />; }
    if (noSections) {
      return <Subheader><FormattedMessage {...translations.noSections} /></Subheader>;
    }

    const { totalStudents, realStudents } = this.getRespondentsCount();
    const responsesCount = this.state.includePhantoms ? totalStudents : realStudents;
    return (
      <div>
        <Card>
          <CardText>
            <h4>
              <FormattedMessage
                {...translations.responsesCount}
                values={{ count: responsesCount.toString() }}
              />
            </h4>
            {
              totalStudents === realStudents ?
                <p><FormattedMessage {...translations.noPhantoms} /></p> :
                <Toggle
                  label={<FormattedMessage {...translations.includePhantoms} />}
                  labelPosition="right"
                  toggled={this.state.includePhantoms}
                  onToggle={(_, value) => this.setState({ includePhantoms: value })}
                />
            }
          </CardText>
        </Card>
        <Subheader><FormattedMessage {...surveyTranslations.questions} /></Subheader>
        {
          this.props.sections.map((section, index) =>
            (<ResultsSection
              key={section.id}
              includePhantoms={this.state.includePhantoms}
              {...{ section, index, anonymous }}
            />)
          )
        }
      </div>
    );
  }
}

const mapStateToProps = state => state.results;
export default connect(mapStateToProps)(SurveyResults);
