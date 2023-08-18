import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import {
  Card,
  CardContent,
  FormControlLabel,
  ListSubheader,
  Switch,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import { fetchResults } from 'course/survey/actions/surveys';
import { sectionShape, surveyShape } from 'course/survey/propTypes';
import surveyTranslations from 'course/survey/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';

import withSurveyLayout from '../../containers/SurveyLayout';

import ResultsSection from './ResultsSection';

const translations = defineMessages({
  results: {
    id: 'course.survey.SurveyResults.results',
    defaultMessage: 'Results',
  },
  includePhantoms: {
    id: 'course.survey.SurveyResults.includePhantoms',
    defaultMessage: 'Include Phantom Students',
  },
  responsesCount: {
    id: 'course.survey.SurveyResults.responsesCount',
    defaultMessage: 'Number of Responses: {count}',
  },
  noSections: {
    id: 'course.survey.SurveyResults.noSections',
    defaultMessage: 'This survey does not have any questions yet.',
  },
  noPhantoms: {
    id: 'course.survey.SurveyResults.noPhantoms',
    defaultMessage: 'No phantom student responses.',
  },
});

export class SurveyResults extends Component {
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
      (sections[0].questions[0].answers &&
        sections[0].questions[0].answers.length < 1)
    ) {
      return { totalStudents: 0, realStudents: 0 };
    }

    const totalStudents = sections[0].questions[0].answers.length;
    const realStudents = sections[0].questions[0].answers.filter(
      (answer) => !answer.phantom,
    ).length;
    return { totalStudents, realStudents };
  }

  render() {
    const {
      sections,
      isLoading,
      survey: { anonymous },
    } = this.props;
    const noSections = sections && sections.length < 1;
    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (noSections) {
      return (
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.noSections} />
        </ListSubheader>
      );
    }

    const { totalStudents, realStudents } = this.getRespondentsCount();
    const responsesCount = this.state.includePhantoms
      ? totalStudents
      : realStudents;
    return (
      <>
        <Card>
          <CardContent>
            <Typography className="font-bold" variant="body2">
              <FormattedMessage
                {...translations.responsesCount}
                values={{ count: responsesCount.toString() }}
              />
            </Typography>
            {totalStudents === realStudents ? (
              <Typography variant="body2">
                <FormattedMessage {...translations.noPhantoms} />
              </Typography>
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.includePhantoms}
                    color="primary"
                    onChange={(_, value) =>
                      this.setState({ includePhantoms: value })
                    }
                  />
                }
                label={
                  <b>
                    <FormattedMessage {...translations.includePhantoms} />
                  </b>
                }
                labelPlacement="end"
              />
            )}
          </CardContent>
        </Card>
        <ListSubheader disableSticky>
          <FormattedMessage {...surveyTranslations.questions} />
        </ListSubheader>
        {this.props.sections.map((section, index) => (
          <ResultsSection
            key={section.id}
            includePhantoms={this.state.includePhantoms}
            {...{ section, index, anonymous }}
          />
        ))}
      </>
    );
  }
}

SurveyResults.propTypes = {
  survey: surveyShape,
  surveyId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  sections: PropTypes.arrayOf(sectionShape),
};

const handle = translations.results;

export default Object.assign(
  withSurveyLayout(connect(({ surveys }) => surveys.results)(SurveyResults)),
  { handle },
);
