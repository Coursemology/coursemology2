import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppSelector } from 'lib/hooks/store';

import { fetchAncestorInfo } from '../../operations/statistics';

import AncestorOptions from './AncestorOptions';
import AncestorStatistics from './AncestorStatistics';
import { getAncestorInfo } from './selectors';

const DuplicationHistoryStatistics: FC = () => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);
  const ancestorInfo = useAppSelector(getAncestorInfo);

  const [selectedAncestorId, setSelectedAncestorId] =
    useState(parsedAssessmentId);

  const fetchAndSetAncestorInfo = async (): Promise<void> => {
    if (ancestorInfo.length > 0) return;
    await fetchAncestorInfo(parsedAssessmentId);
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchAndSetAncestorInfo}>
      <>
        <AncestorOptions
          ancestors={ancestorInfo}
          parsedAssessmentId={parsedAssessmentId}
          selectedAncestorId={selectedAncestorId}
          setSelectedAncestorId={setSelectedAncestorId}
        />
        <div className="mb-8">
          <AncestorStatistics
            currentAssessmentSelected={
              selectedAncestorId === parsedAssessmentId
            }
            selectedAssessmentId={selectedAncestorId}
          />
        </div>
      </>
    </Preload>
  );
};

export default DuplicationHistoryStatistics;
