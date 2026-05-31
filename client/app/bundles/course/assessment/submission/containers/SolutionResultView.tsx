import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { ExpandLess } from '@mui/icons-material';
import Clear from '@mui/icons-material/Clear';
import Done from '@mui/icons-material/Done';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { TextResponseSolutionResult } from 'types/course/assessment/submission/answer/textResponse';

import ExpandableCode from 'lib/components/core/ExpandableCode';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import assessmentTranslations from '../../translations';

const translations = defineMessages({
  expression: {
    id: 'course.assessment.submission.ResultView.solution',
    defaultMessage: 'Solution',
  },
  expected: {
    id: 'course.assessment.submission.ResultView.expected',
    defaultMessage: 'Expected',
  },
  output: {
    id: 'course.assessment.submission.ResultView.output',
    defaultMessage: 'Output',
  },
  exact_match: {
    id: 'course.assessment.submission.ResultView.solutionHeaders.exactMatch',
    defaultMessage: 'Answer matches exactly {solution}',
  },
  keyword: {
    id: 'course.assessment.submission.ResultView.solutionHeaders.keyword',
    defaultMessage: 'Answer contains keyword {solution}',
  },
  regex: {
    id: 'course.assessment.submission.ResultView.solutionHeaders.regex',
    defaultMessage: 'Answer matches regular expression {solution}',
  },
  spreadsheet_formula: {
    id: 'course.assessment.submission.ResultView.solutionHeaders.spreadsheetFormula',
    defaultMessage: 'Answer formula equivalent to {solution}',
  },
});

const invertedTranslations = defineMessages({
  exact_match: {
    id: 'course.assessment.submission.ResultView.solutionInvertedHeaders.exactMatch',
    defaultMessage: 'Answer is not exactly {solution}',
  },
  keyword: {
    id: 'course.assessment.submission.ResultView.solutionInvertedHeaders.keyword',
    defaultMessage: 'Answer does not contain keyword {solution}',
  },
  regex: {
    id: 'course.assessment.submission.ResultView.solutionInvertedHeaders.regex',
    defaultMessage: 'Answer does not match regular expression {solution}',
  },
  spreadsheet_formula: {
    id: 'course.assessment.submission.ResultView.solutionInvertedHeaders.spreadsheetFormula',
    defaultMessage: 'Answer formula not equivalent to {solution}',
  },
});

const SolutionResultIcon: FC<{ correct: boolean | undefined }> = ({
  correct,
}) => {
  if (correct === undefined) {
    return null;
  }
  return correct ? <Done color="success" /> : <Clear color="error" />;
};

const ResultRow: FC<{ result: TextResponseSolutionResult }> = ({ result }) => {
  const { t } = useTranslation();

  const numericMaxGrade = result.maximumGrade;
  const numericGrade = result.grade;
  // Currently, solution grading is all-or-nothing, so higlighting the max grades of matching solutions are sufficient
  const isGraded = numericGrade !== undefined;
  const isMatching = numericGrade === numericMaxGrade;
  const isInverted = numericMaxGrade < 0;
  const [expanded, setExpanded] = useState(true);

  const RowClassMapper = {
    match: 'bg-green-100',
    nonmatch: '',
    inverted_match: 'bg-red-100',
  };

  let classCategory = 'nonmatch';
  if (isGraded) {
    classCategory = isMatching === isInverted ? 'inverted_match' : 'match';
  }

  const rowClassName = RowClassMapper[classCategory];
  const textClassName = isMatching ? '' : 'text-neutral-400';

  const formatGrade = (grade: number | undefined): string => {
    if (grade === undefined) {
      return '';
    }
    return `${grade > 0 ? '+' : ''}${grade}`;
  };

  return (
    <>
      <TableRow
        className={`${rowClassName} ${result.solutionType === 'spreadsheet_formula' ? 'transition hover:brightness-95 cursor-pointer' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="w-full py-0 h-16" colSpan={3}>
          <div className={`flex items-center space-x-2 ${textClassName}`}>
            {result.solutionType === 'spreadsheet_formula' &&
              (expanded ? (
                <ExpandLess className="-ml-3" />
              ) : (
                <ExpandMore className="-ml-3" />
              ))}
            {!isInverted &&
              t(translations[result.solutionType], {
                solution: <code className="mx-1.5">{result.solution}</code>,
              })}
            {isInverted &&
              t(invertedTranslations[result.solutionType], {
                solution: <code className="mx-1.5">{result.solution}</code>,
                b: (...chunks) => <b className="mx-1.5">{chunks}</b>,
              })}
          </div>
        </TableCell>

        <TableCell className="py-0 h-16">
          <div
            className={`flex space-x-6 items-center ${numericGrade !== undefined ? 'justify-between' : 'justify-start'}`}
          >
            <span
              className={`${isMatching ? 'font-bold' : ''} ${textClassName}`}
            >
              {formatGrade(numericMaxGrade)}
            </span>
            <SolutionResultIcon correct={isMatching !== isInverted} />
          </div>
        </TableCell>
      </TableRow>
      {expanded && Boolean(result.tests?.length) && (
        <TableRow
          className={`${result.tests?.[0].correct ? 'bg-green-50' : 'bg-red-50'}`}
        >
          <TableCell className="h-fit border-none py-1 leading-none" />
          <TableCell className="h-fit border-none py-1 leading-none">
            <Typography
              className="break-all"
              color="text.secondary"
              variant="caption"
            >
              {t(translations.expected)}
            </Typography>
          </TableCell>
          <TableCell className="h-fit border-none py-1 leading-none">
            <Typography
              className="break-all"
              color="text.secondary"
              variant="caption"
            >
              {t(translations.output)}
            </Typography>
          </TableCell>
          <TableCell className="h-fit border-none py-1 leading-none" />
        </TableRow>
      )}
      {expanded &&
        (result.tests ?? []).map((resultTest) => (
          <TableRow
            key={`result-test-${resultTest.identifier}`}
            className={`${resultTest.correct ? 'bg-green-50' : 'bg-red-50'}`}
          >
            <TableCell className="py-0 h-14 pl-14">
              {resultTest.identifier}
            </TableCell>
            <TableCell className="py-0 h-14">
              <ExpandableCode>
                {resultTest.expectedError ?? resultTest.expected}
              </ExpandableCode>
            </TableCell>
            <TableCell className="py-0 h-14">
              <ExpandableCode>
                {resultTest.outputError ?? resultTest.output}
              </ExpandableCode>
            </TableCell>
            <TableCell className="py-0 h-14">
              <div className="flex justify-end">
                <SolutionResultIcon correct={resultTest.correct} />
              </div>
            </TableCell>
          </TableRow>
        ))}
    </>
  );
};

const SolutionResultView: FC<{ questionId: number }> = (props) => {
  const { t } = useTranslation();
  const gradingResults = useAppSelector(
    (state) => state.assessments.submission.gradingResults,
  );
  const results = gradingResults.solutionResults[props.questionId] ?? [];

  return (
    <div className="border border-solid border-neutral-400 mb-2 rounded-lg overflow-hidden">
      <Table className="table-fixed">
        <TableHead>
          <TableRow className="h-12">
            <TableCell className="w-full h-full">
              {t(translations.expression)}
            </TableCell>

            <TableCell className="w-full h-full" />

            <TableCell className="w-full h-full" />

            <TableCell className="w-32 h-full">
              {t(assessmentTranslations.grade)}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {results.map((result) => (
            <ResultRow key={result.id} result={result} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SolutionResultView;
