import { ListSubheader, Typography } from '@mui/material';
import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Survey } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation, { MessageTranslator } from 'lib/hooks/useTranslation';
import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { AppDispatch } from 'store';

const { SURVEY } = duplicableItemTypes;

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
    dispatch(actions.setItemSelectedBoolean(SURVEY, survey.id, value));
  });
};

interface RowProps {
  dispatch: AppDispatch;
  selectedItems: Record<string, Record<number, boolean>>;
  survey: Survey;
}

const SurveySelectionRow: FC<RowProps> = (props) => {
  const { dispatch, selectedItems, survey } = props;
  const checked = !!selectedItems[duplicableItemTypes.SURVEY][survey.id];
  const label = (
    <span className="flex flex-row items-center">
      <TypeBadge itemType={SURVEY} />
      {survey.published || <UnpublishedIcon />}
      <Typography className="font-bold">{survey.title}</Typography>
    </span>
  );

  return (
    <IndentedCheckbox
      key={survey.id}
      checked={checked}
      label={label}
      indentLevel={0}
      onChange={(_, value) =>
        dispatch(
          actions.setItemSelectedBoolean(
            duplicableItemTypes.SURVEY,
            survey.id,
            value,
          ),
        )
      }
    />
  );
};

interface BodyProps {
  t: MessageTranslator;
  dispatch: AppDispatch;
  surveys: Survey[];
  selectedItems: Record<string, Record<number, boolean>>;
}

const SurveySelectorBody: FC<BodyProps> = (props) => {
  const { t, dispatch, surveys, selectedItems } = props;

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
        <SurveySelectionRow
          dispatch={dispatch}
          survey={survey}
          selectedItems={selectedItems}
        />
      ))}
    </>
  );
};

const SurveySelector: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);
  const { surveyComponent: surveys, selectedItems } = duplication;

  if (!surveys) {
    return null;
  }

  return (
    <>
      <Typography className="mt-3 mb-1" variant="h6">
        {t(defaultComponentTitles.course_survey_component)}
      </Typography>
      <SurveySelectorBody
        t={t}
        dispatch={dispatch}
        selectedItems={selectedItems}
        surveys={surveys}
      />
    </>
  );
};

export default SurveySelector;
