import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader } from '@mui/material';
import { AppDispatch } from 'store';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import { duplicableItemTypes } from 'course/duplication/constants';
import { actions } from 'course/duplication/store';
import { Survey } from 'course/duplication/types';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import SurveyRow from './SurveyRow';

interface SurveyBodyProps {
  surveys: Survey[];
}

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.SurveysSelector.noItems',
    defaultMessage: 'There are no surveys to duplicate.',
  },
});

const surveySetAll: (
  dispatch: AppDispatch,
  surveys: Survey[],
) => (value: boolean) => void = (dispatch, surveys) => (value) => {
  surveys.forEach((survey) => {
    dispatch(
      actions.setItemSelectedBoolean(
        duplicableItemTypes.SURVEY,
        survey.id,
        value,
      ),
    );
  });
};

const SurveyBody: FC<SurveyBodyProps> = (props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { surveys } = props;

  if (surveys.length < 1) {
    return (
      <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
    );
  }

  return (
    <>
      {surveys.length > 1 ? (
        <BulkSelectors
          callback={surveySetAll(dispatch, surveys)}
          selectLinkClassName="ml-0 leading-6"
        />
      ) : null}
      {surveys.map((survey) => (
        <SurveyRow key={survey.id} survey={survey} />
      ))}
    </>
  );
};

export default SurveyBody;
