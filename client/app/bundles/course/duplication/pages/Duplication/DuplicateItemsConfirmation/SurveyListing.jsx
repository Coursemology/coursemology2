import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Checkbox from 'material-ui/Checkbox';
import Subheader from 'material-ui/Subheader';
import { Card, CardText } from 'material-ui/Card';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { surveyShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';

class SurveyListing extends Component {
  static renderRow(survey) {
    return (
      <Checkbox
        checked
        key={survey.id}
        label={
          <span>
            <TypeBadge itemType={duplicableItemTypes.SURVEY} />
            <UnpublishedIcon tooltipId="itemUnpublished" />
            {survey.title}
          </span>
        }
      />
    );
  }

  selectedSurveys() {
    const { surveys, selectedItems } = this.props;
    return surveys
      ? surveys.filter(
          (survey) => selectedItems[duplicableItemTypes.SURVEY][survey.id],
        )
      : [];
  }

  render() {
    const selectedSurveys = this.selectedSurveys();
    if (selectedSurveys.length < 1) {
      return null;
    }

    return (
      <>
        <Subheader>
          <FormattedMessage
            {...defaultComponentTitles.course_survey_component}
          />
        </Subheader>
        <Card>
          <CardText>{selectedSurveys.map(SurveyListing.renderRow)}</CardText>
        </Card>
      </>
    );
  }
}

SurveyListing.propTypes = {
  surveys: PropTypes.arrayOf(surveyShape),
  selectedItems: PropTypes.shape({}),
};

export default connect(({ duplication }) => ({
  surveys: duplication.surveyComponent,
  selectedItems: duplication.selectedItems,
}))(SurveyListing);
