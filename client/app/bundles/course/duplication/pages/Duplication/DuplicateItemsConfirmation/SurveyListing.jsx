import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  ListSubheader,
} from '@material-ui/core';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { surveyShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';

const styles = {
  row: {
    alignItems: 'center',
    display: 'flex',
    width: 'auto',
  },
};

class SurveyListing extends React.Component {
  static renderRow(survey) {
    return (
      <FormControlLabel
        control={<Checkbox checked color="primary" />}
        key={`survey_${survey.id}`}
        label={
          <span style={{ display: 'flex', alignItems: 'centre' }}>
            <TypeBadge itemType={duplicableItemTypes.SURVEY} />
            <UnpublishedIcon tooltipId="itemUnpublished" />
            {survey.title}
          </span>
        }
        style={styles.row}
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
        <ListSubheader disableSticky>
          <FormattedMessage
            {...defaultComponentTitles.course_survey_component}
          />
        </ListSubheader>
        <Card>
          <CardContent>
            {selectedSurveys.map(SurveyListing.renderRow)}
          </CardContent>
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
