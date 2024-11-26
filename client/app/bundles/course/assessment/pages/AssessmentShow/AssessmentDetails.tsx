import { TableBody, TableCell, TableRow } from '@mui/material';
import { AssessmentData } from 'types/course/assessment/assessments';

import TableContainer from 'lib/components/core/layouts/TableContainer';
import PersonalStartEndTime from 'lib/components/extensions/PersonalStartEndTime';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface AssessmentDetailsProps {
  for: AssessmentData;
}

const AssessmentDetails = (props: AssessmentDetailsProps): JSX.Element => {
  const { for: assessment } = props;
  const { t } = useTranslation();

  return (
    <TableContainer dense variant="outlined">
      <TableBody>
        <TableRow>
          <TableCell variant="head">{t(translations.gradingMode)}</TableCell>

          <TableCell>
            {assessment.autograded
              ? t(translations.autograded)
              : t(translations.manuallyGraded)}
          </TableCell>
        </TableRow>

        {assessment.baseExp && (
          <TableRow>
            <TableCell variant="head">{t(translations.baseExp)}</TableCell>
            <TableCell>{assessment.baseExp.toString()}</TableCell>
          </TableRow>
        )}

        {assessment.timeBonusExp && (
          <TableRow>
            <TableCell variant="head">{t(translations.bonusExp)}</TableCell>
            <TableCell>{assessment.timeBonusExp.toString() ?? '-'}</TableCell>
          </TableRow>
        )}

        <TableRow>
          <TableCell variant="head">{t(translations.startsAt)}</TableCell>
          <TableCell>
            <PersonalStartEndTime long timeInfo={assessment.startAt} />
          </TableCell>
        </TableRow>

        {assessment.timeLimit && (
          <TableRow>
            <TableCell variant="head">{t(translations.timeLimit)}</TableCell>
            <TableCell>
              {t(translations.timeLimitDetail, {
                timeLimit: assessment.timeLimit,
              })}
            </TableCell>
          </TableRow>
        )}

        {assessment.bonusEndAt && (
          <TableRow>
            <TableCell variant="head">{t(translations.bonusEndsAt)}</TableCell>
            <TableCell>
              <PersonalStartEndTime long timeInfo={assessment.bonusEndAt} />
            </TableCell>
          </TableRow>
        )}

        {assessment.hasTodo && (
          <TableRow>
            <TableCell variant="head">{t(translations.hasTodo)}</TableCell>
            <TableCell>{assessment.hasTodo ? '✅' : '❌'}</TableCell>
          </TableRow>
        )}

        <TableRow>
          <TableCell variant="head">{t(translations.endsAt)}</TableCell>
          <TableCell>
            <PersonalStartEndTime long timeInfo={assessment.endAt} />
          </TableCell>
        </TableRow>

        {assessment.permissions.canObserve && (
          <>
            <TableRow>
              <TableCell variant="head">
                {t(translations.showMcqMrqSolution)}
              </TableCell>

              <TableCell>
                {assessment.showMcqMrqSolution ? '✅' : '❌'}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell variant="head">
                {t(translations.gradedTestCases)}
              </TableCell>

              <TableCell>{assessment.gradedTestCases}</TableCell>
            </TableRow>

            {assessment.autograded && (
              <>
                <TableRow>
                  <TableCell variant="head">
                    {t(translations.allowSkipSteps)}
                  </TableCell>

                  <TableCell>{assessment.skippable ? '✅' : '❌'}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell variant="head">
                    {t(translations.allowSubmissionWithIncorrectAnswers)}
                  </TableCell>

                  <TableCell>
                    {assessment.allowPartialSubmission ? '✅' : '❌'}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell variant="head">
                    {t(translations.showMcqSubmitResult)}
                  </TableCell>

                  <TableCell>
                    {assessment.showMcqAnswer ? '✅' : '❌'}
                  </TableCell>
                </TableRow>
              </>
            )}
          </>
        )}
      </TableBody>
    </TableContainer>
  );
};

export default AssessmentDetails;
