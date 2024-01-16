import { defineMessages, FormattedMessage } from 'react-intl';

import { AncestorShape } from 'course/assessment/types';
import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';

import AncestorOptions from './AncestorOptions';

const translations = defineMessages({
  fetchAncestorsFailure: {
    id: 'course.assessment.statistics.ancestorFail',
    defaultMessage: 'Failed to fetch past iterations of this assessment.',
  },
});

interface AncestorSelectProps {
  ancestors: AncestorShape[];
  fetchAncestorSubmissions: (id: number) => void;
  isErrorAncestors: boolean;
  isFetchingAncestors: boolean;
  parsedAssessmentId: number;
  selectedAncestorId: number;
}

const AncestorSelect = (props: AncestorSelectProps): JSX.Element => {
  const {
    ancestors,
    isFetchingAncestors,
    isErrorAncestors,
    parsedAssessmentId,
    selectedAncestorId,
    fetchAncestorSubmissions,
  } = props;
  if (isFetchingAncestors) {
    return <LoadingIndicator />;
  }
  if (isErrorAncestors) {
    return (
      <ErrorCard
        message={<FormattedMessage {...translations.fetchAncestorsFailure} />}
      />
    );
  }
  return (
    <AncestorOptions
      ancestors={ancestors}
      assessmentId={parsedAssessmentId}
      selectedAncestorId={selectedAncestorId}
      setSelectedAncestorId={fetchAncestorSubmissions}
    />
  );
};

export default AncestorSelect;
