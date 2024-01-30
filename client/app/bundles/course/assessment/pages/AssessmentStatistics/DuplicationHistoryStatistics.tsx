import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAppSelector } from 'lib/hooks/store';

import AncestorOptions from './AncestorOptions';
import AncestorStatistics from './AncestorStatistics';
import { getAssessmentStatistics } from './selectors';

const DuplicationHistoryStatistics: FC = () => {
  const ancestors = useAppSelector(getAssessmentStatistics).ancestors;

  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const [selectedAncestorId, setSelectedAncestorId] =
    useState(parsedAssessmentId);

  return (
    <>
      <AncestorOptions
        ancestors={ancestors}
        parsedAssessmentId={parsedAssessmentId}
        selectedAncestorId={selectedAncestorId}
        setSelectedAncestorId={setSelectedAncestorId}
      />
      <div className="mb-8">
        <AncestorStatistics
          currentAssessmentSelected={selectedAncestorId === parsedAssessmentId}
          selectedAssessmentId={selectedAncestorId}
        />
      </div>
    </>
  );
};

export default DuplicationHistoryStatistics;
