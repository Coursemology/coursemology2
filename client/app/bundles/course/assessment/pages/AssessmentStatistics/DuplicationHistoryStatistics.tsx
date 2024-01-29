import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';

import {
  fetchAncestors,
  fetchStatistics,
} from 'course/assessment/operations/statistics';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import AncestorSelect from './AncestorSelect';
import { getAssessmentStatistics } from './selectors';

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
  const ancestors = useAppSelector(getAssessmentStatistics).ancestors;

  const { assessmentId } = useParams();
  const dispatch = useAppDispatch();

  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const [selectedAncestorId, setSelectedAncestorId] =
    useState(parsedAssessmentId);

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

  const fetchAncestorSubmissions = (id: number): void => {
    if (id === selectedAncestorId) {
      return;
    }
    // dispatch(
    //   fetchAncestorStatistics(
    //     id,
    //     t(translations.fetchAncestorStatisticsFailure),
    //   ),
    // );
    setSelectedAncestorId(id);
  };

  return (
    <>
      <AncestorSelect
        ancestors={ancestors}
        fetchAncestorSubmissions={fetchAncestorSubmissions}
        isErrorAncestors={false}
        isFetchingAncestors={false}
        parsedAssessmentId={parsedAssessmentId}
        selectedAncestorId={selectedAncestorId}
      />
      {/* <div className="mb-8">
        <AncestorStatistics
          ancestorAllStudents={statisticsPage.ancestorAllStudents}
          ancestorSubmissions={statisticsPage.ancestorSubmissions}
          currentAssessmentSelected={selectedAncestorId === parsedAssessmentId}
          isErrorAncestorStatistics={statisticsPage.isErrorAncestorStatistics}
          isFetchingAncestorStatistics={
            statisticsPage.isFetchingAncestorStatistics
          }
        />
      </div> */}
    </>
  );
};

export default DuplicationHistoryStatistics;
