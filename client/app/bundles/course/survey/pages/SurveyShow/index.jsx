import { useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { ListSubheader } from '@mui/material';
import PropTypes from 'prop-types';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import useTranslation from 'lib/hooks/useTranslation';

import { changeSection, finalizeOrder, reorder } from '../../actions/questions';
import { fetchSurvey, loadSurvey } from '../../actions/surveys';
import { surveyShape } from '../../propTypes';
import surveyTranslations from '../../translations';

import Section from './Section';
import SurveyDetails from './SurveyDetails';

const translations = defineMessages({
  empty: {
    id: 'course.surveys.SurveyShow.empty',
    defaultMessage: 'This survey does not have any questions.',
  },
  reorderSuccess: {
    id: 'course.surveys.Question.reorderSuccess',
    defaultMessage: 'Question moved.',
  },
  reorderFailure: {
    id: 'course.surveys.Question.reorderFailure',
    defaultMessage: 'Failed to move question.',
  },
});

const SurveyShow = ({
  dispatch,
  surveyId,
  isLoading,
  disabled,
  survey,
  courseId,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchSurvey(surveyId));
  }, [dispatch, surveyId]);

  if (isLoading) return <LoadingIndicator />;

  const reorderQuestion = (result) => {
    if (!result.destination) return;

    const src = result.source;
    const dest = result.destination;

    if (src.droppableId === dest.droppableId && src.index === dest.index)
      return;

    const srcSectionIndex = parseInt(src.droppableId.match(/\d+/)[0], 10);
    const destSectionIndex = parseInt(dest.droppableId.match(/\d+/)[0], 10);
    if (Number.isNaN(srcSectionIndex) || Number.isNaN(destSectionIndex)) return;

    const previousState = survey;

    if (srcSectionIndex === destSectionIndex) {
      dispatch(reorder(srcSectionIndex, src.index, dest.index));
    } else {
      dispatch(
        changeSection(true, src.index, srcSectionIndex, destSectionIndex),
      );
      dispatch(reorder(destSectionIndex, 0, dest.index));
    }

    dispatch(
      finalizeOrder(
        t(translations.reorderSuccess),
        t(translations.reorderFailure),
        () => dispatch(loadSurvey(previousState)),
      ),
    );
  };

  const renderBody = () => {
    const { sections, canUpdate } = survey;
    if (!canUpdate) return null;

    if (!sections || sections.length < 1)
      return (
        <ListSubheader disableSticky={true}>
          {t(translations.empty)}
        </ListSubheader>
      );

    const lastIndex = sections.length - 1;

    return (
      <>
        <ListSubheader disableSticky={true}>
          {t(surveyTranslations.questions)}
        </ListSubheader>

        <DragDropContext onDragEnd={reorderQuestion}>
          {sections.map((section, index) => (
            <Section
              key={section.id}
              first={index === 0}
              last={index === lastIndex}
              {...{ section, index, survey, disabled }}
            />
          ))}
        </DragDropContext>
      </>
    );
  };

  return (
    <>
      <SurveyDetails {...{ survey, courseId, disabled }} />
      {renderBody()}
    </>
  );
};

SurveyShow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  survey: surveyShape,
  isLoading: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  surveyId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  isLoading: state.surveysFlags.isLoadingSurvey,
  disabled: state.surveysFlags.disableSurveyShow,
});

export const ConnectedSurveyShow = connect(mapStateToProps)(SurveyShow);
export default ConnectedSurveyShow;
