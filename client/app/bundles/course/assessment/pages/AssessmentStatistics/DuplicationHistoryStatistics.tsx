import { FC, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import {
  fetchAncestors,
  fetchAncestorStatistics,
  fetchStatistics,
} from 'course/assessment/operations';
import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import AncestorSelect from './AncestorSelect';
import AncestorStatistics from './AncestorStatistics';
import { getStatisticsPage } from './selectors';

const translations = defineMessages({
  fetchFailure: {
    id: 'course.assessment.statistics.fail',
    defaultMessage: 'Failed to fetch statistics.',
  },
  fetchAncestorsFailure: {
    id: 'course.assessment.statistics.ancestorFail',
    defaultMessage: 'Failed to fetch past iterations of this assessment.',
  },
  fetchAncestorStatisticsFailure: {
    id: 'course.assessment.statistics.ancestorStatisticsFail',
    defaultMessage: "Failed to fetch ancestor's statistics.",
  },
});

const DuplicationHistoryStatistics: FC = () => {
  const { t } = useTranslation();
  const { assessmentId } = useParams();
  const dispatch = useAppDispatch();

  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const [selectedAncestorId, setSelectedAncestorId] =
    useState(parsedAssessmentId);
  const statisticsPage = useAppSelector(getStatisticsPage);

  useEffect(() => {
    if (assessmentId) {
      dispatch(
        fetchStatistics(parsedAssessmentId, t(translations.fetchFailure)),
      );
      dispatch(
        fetchAncestors(
          parsedAssessmentId,
          t(translations.fetchAncestorsFailure),
        ),
      );
    }
  }, [assessmentId]);

  if (statisticsPage.isFetching) {
    return <LoadingIndicator />;
  }

  if (statisticsPage.isError) {
    return (
      <ErrorCard
        message={<FormattedMessage {...translations.fetchFailure} />}
      />
    );
  }

  const fetchAncestorSubmissions = (id: number): void => {
    if (id === selectedAncestorId) {
      return;
    }
    dispatch(
      fetchAncestorStatistics(
        id,
        t(translations.fetchAncestorStatisticsFailure),
      ),
    );
    setSelectedAncestorId(id);
  };

  return (
    <>
      <AncestorSelect
        ancestors={statisticsPage.ancestors}
        fetchAncestorSubmissions={fetchAncestorSubmissions}
        isErrorAncestors={statisticsPage.isErrorAncestors}
        isFetchingAncestors={statisticsPage.isFetchingAncestors}
        parsedAssessmentId={parsedAssessmentId}
        selectedAncestorId={selectedAncestorId}
      />
      <div className="mb-8">
        <AncestorStatistics
          ancestorAllStudents={statisticsPage.ancestorAllStudents}
          ancestorSubmissions={statisticsPage.ancestorSubmissions}
          currentAssessmentSelected={selectedAncestorId === parsedAssessmentId}
          isErrorAncestorStatistics={statisticsPage.isErrorAncestorStatistics}
          isFetchingAncestorStatistics={
            statisticsPage.isFetchingAncestorStatistics
          }
        />
      </div>
    </>
  );
};

export default DuplicationHistoryStatistics;
