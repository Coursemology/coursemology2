import { TableBody, TableCell, TableRow } from '@mui/material';

// Reuse the assessment show-page's own message descriptors so wording (and locale entries) stay
// identical to AssessmentShow/AssessmentDetails.tsx — no duplicate marketplace keys.
import translations from 'course/assessment/translations';
import TableContainer from 'lib/components/core/layouts/TableContainer';
import useTranslation from 'lib/hooks/useTranslation';

import { ListingPreviewData } from '../../types';

interface Props {
  for: ListingPreviewData;
}

const row = (head: string, value: React.ReactNode): JSX.Element => (
  <TableRow>
    <TableCell variant="head">{head}</TableCell>
    <TableCell>{value}</TableCell>
  </TableRow>
);

const PreviewAssessmentDetails = ({ for: a }: Props): JSX.Element => {
  const { t } = useTranslation();
  return (
    <TableContainer dense variant="outlined">
      <TableBody>
        {row(
          t(translations.gradingMode),
          a.gradingMode === 'autograded'
            ? t(translations.autograded)
            : t(translations.manuallyGraded),
        )}
        {a.baseExp != null &&
          row(t(translations.baseExp), a.baseExp.toString())}
        {a.bonusExp != null &&
          row(t(translations.bonusExp), a.bonusExp.toString())}
        {row(
          t(translations.showMcqMrqSolution),
          a.showMcqMrqSolution ? '✅' : '❌',
        )}
        {row(
          t(translations.showRubricToStudents),
          a.showRubricToStudents ? '✅' : '❌',
        )}
        {row(t(translations.gradedTestCases), a.gradedTestCases)}
      </TableBody>
    </TableContainer>
  );
};

export default PreviewAssessmentDetails;
