import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  ListSubheader,
} from '@mui/material';
import PropTypes from 'prop-types';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { surveyShape } from 'course/duplication/propTypes';
import componentTranslations from 'course/translations';

const styles = {
  row: {
    alignItems: 'center',
    display: 'flex',
    width: 'auto',
  },
};

class SurveyListing extends Component {
  static renderRow(survey) {
    return (
      <FormControlLabel
        key={`survey_${survey.id}`}
        control={<Checkbox checked />}
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
            {...componentTranslations.course_survey_component}
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
