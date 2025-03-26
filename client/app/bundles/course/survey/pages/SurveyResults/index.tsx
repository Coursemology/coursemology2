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

import submissionTranslations from 'course/assessment/submission/pages/SubmissionsIndex/translations';
import { fetchResults } from 'course/survey/actions/surveys';
import surveyTranslations from 'course/survey/translations';
import CourseUserTypeTabs, {
  CourseUserType,
  CourseUserTypeTabValue,
  getCurrentSelectedUserType,
} from 'lib/components/core/CourseUserTypeTabs';
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

interface SurveyResultsProps {
  survey: {
    anonymous: boolean;
  };
  surveyId: string;
}

interface Answer {
  phantom: boolean;
  isStudent: boolean;
  myStudent?: boolean;
}
type AnswerFilter = (answer: Answer) => boolean;

const CourseUserTypeAnswerFilterMapper: Record<CourseUserType, AnswerFilter> = {
  [CourseUserType.MY_STUDENTS]: (answer) =>
    !answer.phantom && answer.isStudent && Boolean(answer.myStudent),
  [CourseUserType.MY_STUDENTS_W_PHANTOM]: (answer) =>
    answer.isStudent && Boolean(answer.myStudent),
  [CourseUserType.STUDENTS]: (answer) => !answer.phantom && answer.isStudent,
  [CourseUserType.STUDENTS_W_PHANTOM]: (answer) => answer.isStudent,
  [CourseUserType.STAFF]: (answer) => !answer.phantom && !answer.isStudent,
  [CourseUserType.STAFF_W_PHANTOM]: (answer) => !answer.isStudent,
};

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
  const [tab, setTab] = useState<CourseUserTypeTabValue>(
    CourseUserTypeTabValue.MY_STUDENTS_TAB,
  );

  useEffect(() => {
    dispatch(fetchResults(surveyId));
  }, [dispatch]);

  const currentSelectedUserType = getCurrentSelectedUserType(
    tab,
    isIncludingPhantoms,
  );

  const getFilteredResponsesCount = (answerFilter: AnswerFilter): number => {
    if (
      !sections?.length ||
      !sections[0]?.questions?.length ||
      !sections[0]?.questions[0]?.answers?.length
    ) {
      return 0;
    }
    return sections[0].questions[0].answers.filter(answerFilter).length;
  };

  const responsesCountMapper = Object.fromEntries(
    Object.entries(CourseUserTypeAnswerFilterMapper).map(
      ([userType, answerFilter]) => [
        userType,
        getFilteredResponsesCount(answerFilter),
      ],
    ),
  );
  const myStudentsExist = isIncludingPhantoms
    ? responsesCountMapper[CourseUserType.MY_STUDENTS_W_PHANTOM] > 0
    : responsesCountMapper[CourseUserType.MY_STUDENTS] > 0;

  useEffect(() => {
    if (tab === CourseUserTypeTabValue.MY_STUDENTS_TAB && !myStudentsExist) {
      setTab(CourseUserTypeTabValue.STUDENTS_TAB);
    }
  }, [dispatch, myStudentsExist]);

  const noSections = sections && sections.length < 1;
  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (noSections) {
    return (
      <ListSubheader disableSticky>{t(translations.noSections)}</ListSubheader>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <CourseUserTypeTabs
            myStudentsExist={myStudentsExist}
            onChange={(_, value) => setTab(value)}
            value={tab}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isIncludingPhantoms}
                color="primary"
                onChange={(_, value) => setIsIncludingPhantoms(value)}
              />
            }
            label={<b>{t(submissionTranslations.includePhantoms)}</b>}
            labelPlacement="end"
          />
          <Typography className="font-bold" variant="body2">
            {t(translations.responsesCount, {
              count: responsesCountMapper[currentSelectedUserType],
            })}
          </Typography>
        </CardContent>
      </Card>
      <ListSubheader disableSticky>
        {t(surveyTranslations.questions)}
      </ListSubheader>
      {sections.map((section, index) => (
        <ResultsSection
          key={section.id}
          answerFilter={
            CourseUserTypeAnswerFilterMapper[currentSelectedUserType]
          }
          {...{ section, index, anonymous }}
        />
      ))}
    </>
  );
};

const handle = translations.results;

export default Object.assign(withSurveyLayout(SurveyResults), { handle });
