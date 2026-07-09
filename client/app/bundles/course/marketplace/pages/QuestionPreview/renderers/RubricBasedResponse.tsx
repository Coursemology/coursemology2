import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

// Field labels (Rubric heading, Grade, Explanation) come from course/assessment/translations;
// only the "Bonus" category chip has no equivalent there and lives in the marketplace translations.
import translations from 'course/assessment/translations';
import Section from 'lib/components/core/layouts/Section';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import useTranslation from 'lib/hooks/useTranslation';

import previewTranslations from '../../../translations';
import { QuestionPreviewData } from '../../../types';

import { RendererProps } from './types';

type RubricDetail = Extract<
  QuestionPreviewData['detail'],
  { categories: unknown }
>;

const RubricBasedResponse = ({ question }: RendererProps): JSX.Element => {
  const { t } = useTranslation();
  const detail = question.detail as RubricDetail;
  return (
    <div data-testid="renderer-RubricBasedResponse">
      <Section title={t(translations.rubric)}>
        {detail.categories.map((category) => (
          <section key={category.name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Typography variant="subtitle1">{category.name}</Typography>
              {category.isBonus && (
                <Chip
                  color="warning"
                  label={t(previewTranslations.bonus)}
                  size="small"
                  variant="outlined"
                />
              )}
            </div>
            <div className="overflow-x-auto">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t(translations.grade)}</TableCell>
                    <TableCell>{t(translations.explanation)}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {category.criteria.map((criterion, index) => (
                    <TableRow key={`${category.name}-${index}`}>
                      <TableCell>{criterion.grade}</TableCell>
                      <TableCell>
                        <UserHTMLText html={criterion.explanation} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        ))}
      </Section>
    </div>
  );
};

export default RubricBasedResponse;
