import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAppSelector } from 'lib/hooks/store';

import AncestorSelect from './AncestorSelect';
import { getAssessmentStatistics } from './selectors';

const DuplicationHistoryStatistics: FC = () => {
  const ancestors = useAppSelector(getAssessmentStatistics).ancestors;

  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const [selectedAncestorId, setSelectedAncestorId] =
    useState(parsedAssessmentId);

  const fetchAncestorSubmissions = (id: number): void => {
    if (id === selectedAncestorId) {
      return;
    }
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
