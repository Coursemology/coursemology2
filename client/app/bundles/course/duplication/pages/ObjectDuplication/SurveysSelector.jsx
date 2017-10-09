import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import Checkbox from 'material-ui/Checkbox';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { setItemSelectedBoolean } from 'course/duplication/actions';
import { surveyShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.SurveysSelector.noItems',
    defaultMessage: 'There are no surveys to duplicate.',
  },
});

class SurveysSelector extends React.Component {
  static propTypes = {
    surveys: PropTypes.arrayOf(surveyShape),
    selectedItems: PropTypes.shape(),

    dispatch: PropTypes.func.isRequired,
  }

  renderRow(survey) {
    const { dispatch, selectedItems } = this.props;
    const checked = !!selectedItems[duplicableItemTypes.SURVEY][survey.id];

    return (
      <Checkbox
        key={survey.id}
        label={
          <span>
            <TypeBadge itemType={duplicableItemTypes.SURVEY} />
            { survey.published || <UnpublishedIcon /> }
            {survey.title}
          </span>
        }
        checked={checked}
        onCheck={(e, value) =>
          dispatch(setItemSelectedBoolean(duplicableItemTypes.SURVEY, survey.id, value))
        }
      />
    );
  }

  render() {
    const { surveys } = this.props;
    if (!surveys) { return null; }

    return (
      <div>
        <h2><FormattedMessage {...defaultComponentTitles.course_survey_component} /></h2>
        {
          surveys.length > 0 ?
          surveys.map(survey => this.renderRow(survey)) :
          <Subheader>
            <FormattedMessage {...translations.noItems} />
          </Subheader>
        }
      </div>
    );
  }
}

export default connect(({ objectDuplication }) => ({
  surveys: objectDuplication.surveyComponent,
  selectedItems: objectDuplication.selectedItems,
}))(SurveysSelector);
