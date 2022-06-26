import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createDragDropManager } from 'dnd-core';
import { ListSubheader } from '@mui/material';
import surveyTranslations from 'course/survey/translations';
import { surveyShape } from 'course/survey/propTypes';
import * as surveyActions from 'course/survey/actions/surveys';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import SurveyDetails from './SurveyDetails';
import Section from './Section';

const translations = defineMessages({
  empty: {
    id: 'course.surveys.SurveyShow.empty',
    defaultMessage: 'This survey does not have any questions.',
  },
});

const SurveyShow = ({
  dispatch,
  surveyId,
  isLoading,
  disabled,
  intl,
  survey,
  courseId,
  manager,
}) => {
  useEffect(() => {
    dispatch(surveyActions.fetchSurvey(surveyId));
  }, [dispatch, surveyId]);

  const managerToUse = useMemo(
    () => manager ?? createDragDropManager(HTML5Backend),
    [manager],
  );

  const renderBody = () => {
    const { sections, canUpdate } = survey;
    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (!canUpdate) {
      return null;
    }
    if (!sections || sections.length < 1) {
      return (
        <ListSubheader disableSticky>
          {intl.formatMessage(translations.empty)}
        </ListSubheader>
      );
    }
    const lastIndex = sections.length - 1;

    return (
      <>
        <ListSubheader disableSticky>
          {intl.formatMessage(surveyTranslations.questions)}
        </ListSubheader>
        {sections.map((section, index) => (
          <Section
            key={section.id}
            first={index === 0}
            last={index === lastIndex}
            {...{ section, index, survey, disabled }}
          />
        ))}
      </>
    );
  };

  return (
    <DndProvider manager={managerToUse} key={1}>
      <SurveyDetails {...{ survey, courseId, disabled }} />
      {renderBody(survey)}
    </DndProvider>
  );
};

SurveyShow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  survey: surveyShape,
  intl: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  surveyId: PropTypes.string.isRequired,

  // Used for injecting dependencies for testing DnD
  manager: PropTypes.object,
};

const mapStateToProps = (state) => ({
  isLoading: state.surveysFlags.isLoadingSurvey,
  disabled: state.surveysFlags.disableSurveyShow,
});
export const ConnectedSurveyShow = connect(mapStateToProps)(
  injectIntl(SurveyShow),
);
export default ConnectedSurveyShow;
