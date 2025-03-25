import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Card,
  CardContent,
  FormControlLabel,
  ListSubheader,
  Switch,
  Typography,
} from '@mui/material';

import { fetchResults } from 'course/survey/actions/surveys';
import surveyTranslations from 'course/survey/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

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

interface RespondentCounts {
  totalStudents: number;
  realStudents: number;
}

interface SurveyResultsProps {
  survey: {
    anonymous: boolean;
  };
  surveyId: string;
}

const SurveyResults: FC<SurveyResultsProps> = (props) => {
  const {
    survey: { anonymous },
    surveyId,
  } = props;
  const { isLoading, sections } = useAppSelector(
    (state) => state.surveys.results,
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [isIncludingPhantoms, setIsIncludingPhantoms] = useState(true);

  useEffect(() => {
    dispatch(fetchResults(surveyId));
  }, [dispatch]);

  const getRespondentsCount = (): RespondentCounts => {
    if (
      !sections?.length ||
      !sections[0]?.questions?.length ||
      !sections[0]?.questions[0]?.answers?.length
    ) {
      return { totalStudents: 0, realStudents: 0 };
    }

    const totalStudents = sections[0].questions[0].answers.length;
    const realStudents = sections[0].questions[0].answers.filter(
      (answer) => !answer.phantom,
    ).length;
    return { totalStudents, realStudents };
  };

  const noSections = sections && sections.length < 1;
  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (noSections) {
    return (
      <ListSubheader disableSticky>{t(translations.noSections)}</ListSubheader>
    );
  }

  const { totalStudents, realStudents } = getRespondentsCount();
  const responsesCount = isIncludingPhantoms ? totalStudents : realStudents;
  return (
    <>
      <Card>
        <CardContent>
          <Typography className="font-bold" variant="body2">
            {t(translations.responsesCount, {
              count: responsesCount.toString(),
            })}
          </Typography>
          {totalStudents === realStudents ? (
            <Typography variant="body2">
              {t(translations.noPhantoms)}
            </Typography>
          ) : (
            <FormControlLabel
              control={
                <Switch
                  checked={isIncludingPhantoms}
                  color="primary"
                  onChange={(_, value) => setIsIncludingPhantoms(value)}
                />
              }
              label={<b>{t(translations.includePhantoms)}</b>}
              labelPlacement="end"
            />
          )}
        </CardContent>
      </Card>
      <ListSubheader disableSticky>
        {t(surveyTranslations.questions)}
      </ListSubheader>
      {sections.map((section, index) => (
        <ResultsSection
          key={section.id}
          includePhantoms={isIncludingPhantoms}
          {...{ section, index, anonymous }}
        />
      ))}
    </>
  );
};

const handle = translations.results;

export default Object.assign(withSurveyLayout(SurveyResults), { handle });
