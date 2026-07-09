import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

// Reuse the programming-editor field labels (Language/limits, Templates, Test cases, and the
// Expression/Expected/Hint table headers) from course/assessment/translations.
import translations from 'course/assessment/translations';
import Section from 'lib/components/core/layouts/Section';
import useTranslation from 'lib/hooks/useTranslation';

import { ProgrammingTestCase, QuestionPreviewData } from '../../../types';

import { RendererProps } from './types';

type ProgrammingDetail = Extract<
  QuestionPreviewData['detail'],
  { templateFiles: unknown }
>;

interface TestCaseTableProps {
  title: string;
  rows: ProgrammingTestCase[];
}

const TestCaseTable = ({
  title,
  rows,
}: TestCaseTableProps): JSX.Element | null => {
  const { t } = useTranslation();
  if (!rows.length) return null;
  return (
    <section className="mt-4">
      <Typography variant="subtitle2">{title}</Typography>
      <div className="overflow-x-auto">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t(translations.expression)}</TableCell>
              <TableCell>{t(translations.expected)}</TableCell>
              <TableCell>{t(translations.hint)}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((tc) => (
              <TableRow key={tc.identifier}>
                <TableCell>{tc.expression}</TableCell>
                <TableCell>{tc.expected}</TableCell>
                <TableCell>{tc.hint}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

const LabeledRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}): JSX.Element => (
  <div>
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography>{value}</Typography>
  </div>
);

const Programming = ({ question }: RendererProps): JSX.Element => {
  const { t } = useTranslation();
  const detail = question.detail as ProgrammingDetail;
  return (
    <div data-testid="renderer-Programming">
      <Section title={t(translations.language)}>
        <LabeledRow
          label={t(translations.language)}
          value={detail.languageName}
        />
        <LabeledRow
          label={t(translations.memoryLimit)}
          value={detail.memoryLimit ?? '-'}
        />
        <LabeledRow
          label={t(translations.timeLimit)}
          value={detail.timeLimit ?? '-'}
        />
      </Section>

      <Section title={t(translations.templates)}>
        {detail.templateFiles.map((file) => (
          <div key={file.filename}>
            <Typography variant="subtitle2">{file.filename}</Typography>
            <pre className="overflow-x-auto rounded bg-neutral-100 p-3">
              {file.content}
            </pre>
          </div>
        ))}
      </Section>

      <Section title={t(translations.testCases)}>
        <TestCaseTable
          rows={detail.publicTestCases}
          title={t(translations.publicTestCases)}
        />
        <TestCaseTable
          rows={detail.privateTestCases}
          title={t(translations.privateTestCases)}
        />
        <TestCaseTable
          rows={detail.evaluationTestCases}
          title={t(translations.evaluationTestCases)}
        />
      </Section>
    </div>
  );
};

export default Programming;
