import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader, Typography } from '@mui/material';

import BulkSelectors from 'lib/components/core/BulkSelectors';
import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { selectDuplicationStore } from 'course/duplication/selectors';
import { actions } from 'course/duplication/store';
import { DuplicationSurveyData } from 'course/duplication/types';
import componentTranslations from 'course/translations';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.SurveysSelector.noItems',
    defaultMessage: 'There are no surveys to duplicate.',
  },
});

const SurveysSelector: FC = () => {
  const { surveyComponent: surveys, selectedItems } = useAppSelector(
    selectDuplicationStore,
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  if (!surveys) return null;

  const setAllDuplicationSurveyDatasSelection = (value: boolean): void => {
    surveys.forEach((survey) => {
      dispatch(actions.setItemSelectedBoolean('SURVEY', survey.id, value));
    });
  };

  const renderRow = (survey: DuplicationSurveyData): JSX.Element => {
    const checked = !!selectedItems.SURVEY[survey.id];
    return (
      <IndentedCheckbox
        key={survey.id}
        checked={checked}
        label={
          <span className="flex items-center">
            <TypeBadge itemType="SURVEY" />
            {survey.published || <UnpublishedIcon />}
            {survey.title}
          </span>
        }
        onChange={(_, value) =>
          dispatch(actions.setItemSelectedBoolean('SURVEY', survey.id, value))
        }
      />
    );
  };

  const renderBody = (): JSX.Element => {
    if (surveys.length < 1) {
      return (
        <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
      );
    }
    return (
      <>
        {surveys.length > 1 && (
          <BulkSelectors
            callback={setAllDuplicationSurveyDatasSelection}
            styles={{ selectLink: { marginLeft: 0 } }}
          />
        )}
        {surveys.map(renderRow)}
      </>
    );
  };

  return (
    <>
      <Typography className="mt-5 mb-5" variant="h2">
        {t(componentTranslations.course_survey_component)}
      </Typography>
      {renderBody()}
    </>
  );
};

export default SurveysSelector;
