import { FC, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Button,
  FormControlLabel,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from 'types/course/gradebook';

import useTranslation from 'lib/hooks/useTranslation';

import {
  computeStudentTotal,
  computeTabSubtotal,
  sumWeights,
} from '../computeWeighted';

import ConfigureWeightsDialog from './ConfigureWeightsDialog';

interface Props {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
  canManageWeights: boolean;
  courseTitle: string;
}

const translations = defineMessages({
  configureWeights: {
    id: 'course.gradebook.GradebookWeightedTable.configure',
    defaultMessage: 'Configure Weights',
  },
  treatUngradedAsZero: {
    id: 'course.gradebook.GradebookWeightedTable.treatUngradedAsZero',
    defaultMessage: 'Treat Ungraded as 0',
  },
  total: {
    id: 'course.gradebook.GradebookWeightedTable.total',
    defaultMessage: 'Total',
  },
  totalSubheader: {
    id: 'course.gradebook.GradebookWeightedTable.totalSubheader',
    defaultMessage: '{sum}% total',
  },
  sumWarningTooltip: {
    id: 'course.gradebook.GradebookWeightedTable.sumWarningTooltip',
    defaultMessage: 'Tab weights sum to {sum}%. Configure Weights to fix.',
  },
  weightSubheader: {
    id: 'course.gradebook.GradebookWeightedTable.weightSubheader',
    defaultMessage: '{weight}% of grade',
  },
  emptyStateTitle: {
    id: 'course.gradebook.GradebookWeightedTable.emptyStateTitle',
    defaultMessage: 'No tab weights configured.',
  },
  emptyStateBody: {
    id: 'course.gradebook.GradebookWeightedTable.emptyStateBody',
    defaultMessage: 'Click Configure Weights to start.',
  },
  name: {
    id: 'course.gradebook.GradebookWeightedTable.name',
    defaultMessage: 'Name',
  },
});

const formatPct = (v: number | null): string =>
  v == null ? '—' : `${(v * 100).toFixed(2)}%`;

const GradebookWeightedTable: FC<Props> = ({
  categories,
  tabs,
  assessments,
  students,
  submissions,
  canManageWeights,
  courseTitle: _courseTitle,
}) => {
  const { t } = useTranslation();
  const [treatUngradedAsZero, setTreatUngradedAsZero] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 3-row sticky header measurement
  const row1Ref = useRef<HTMLTableRowElement>(null);
  const row2Ref = useRef<HTMLTableRowElement>(null);
  const [row2Top, setRow2Top] = useState(0);
  const [row3Top, setRow3Top] = useState(0);
  useLayoutEffect(() => {
    const h1 = row1Ref.current?.offsetHeight ?? 0;
    const h2 = row2Ref.current?.offsetHeight ?? 0;
    setRow2Top(h1);
    setRow3Top(h1 + h2);
  }, [tabs, categories]);

  const rows = useMemo(
    () =>
      students.map((stu) => {
        const subtotalsByTabId: Record<number, number | null> =
          Object.fromEntries(
            tabs.map((tab) => [
              tab.id,
              computeTabSubtotal({
                studentId: stu.id,
                tab,
                assessments,
                submissions,
                treatUngradedAsZero,
              }),
            ]),
          );
        const total = computeStudentTotal({
          studentId: stu.id,
          tabs,
          assessments,
          submissions,
          treatUngradedAsZero,
        });
        return {
          studentId: stu.id,
          name: stu.name,
          subtotalsByTabId,
          total,
        };
      }),
    [students, tabs, assessments, submissions, treatUngradedAsZero],
  );

  const weightSum = sumWeights(tabs);
  const allWeightsZero = weightSum === 0;

  // Category colSpan map
  const tabsByCategory = useMemo(
    () =>
      tabs.reduce((map, tab) => {
        const existing = map.get(tab.categoryId) ?? [];
        return map.set(tab.categoryId, [...existing, tab]);
      }, new Map<number, TabData[]>()),
    [tabs],
  );

  return (
    <div data-testid="gradebook-weighted-table">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-5 py-2">
        {canManageWeights && (
          <Button onClick={() => setDialogOpen(true)} variant="outlined">
            {t(translations.configureWeights)}
          </Button>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={treatUngradedAsZero}
              onChange={(e) => setTreatUngradedAsZero(e.target.checked)}
            />
          }
          label={t(translations.treatUngradedAsZero)}
        />
      </div>

      {/* Empty state */}
      {allWeightsZero && (
        <Paper sx={{ p: 2, mb: 2, mx: 5 }}>
          <Typography fontWeight={500}>
            {t(translations.emptyStateTitle)}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {t(translations.emptyStateBody)}
          </Typography>
        </Paper>
      )}

      {/* Table */}
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            {/* Row 1: categories + Total */}
            <TableRow ref={row1Ref}>
              <TableCell sx={{ top: 0, zIndex: 4 }}>
                {t(translations.name)}
              </TableCell>
              {categories.map((cat) => {
                const catTabs = tabsByCategory.get(cat.id) ?? [];
                return (
                  <TableCell
                    key={cat.id}
                    align="center"
                    colSpan={catTabs.length}
                    sx={{ top: 0, zIndex: 4 }}
                  >
                    {cat.title}
                  </TableCell>
                );
              })}
              <TableCell align="right" sx={{ top: 0, zIndex: 4 }}>
                {t(translations.total)}
              </TableCell>
            </TableRow>

            {/* Row 2: tab titles */}
            <TableRow
              ref={row2Ref}
              sx={{
                '& .MuiTableCell-stickyHeader': { top: row2Top, zIndex: 3 },
              }}
            >
              <TableCell sx={{ top: row2Top, zIndex: 3 }} />
              {tabs.map((tab) => (
                <TableCell
                  key={tab.id}
                  align="right"
                  sx={{ top: row2Top, zIndex: 3 }}
                >
                  {tab.title}
                </TableCell>
              ))}
              <TableCell sx={{ top: row2Top, zIndex: 3 }} />
            </TableRow>

            {/* Row 3: weight subheaders */}
            <TableRow
              sx={{
                '& .MuiTableCell-stickyHeader': { top: row3Top, zIndex: 2 },
              }}
            >
              <TableCell sx={{ top: row3Top, zIndex: 2 }} />
              {tabs.map((tab) => (
                <TableCell
                  key={tab.id}
                  align="right"
                  sx={{ top: row3Top, zIndex: 2, color: 'text.secondary' }}
                >
                  {t(translations.weightSubheader, {
                    weight: tab.gradebookWeight ?? 0,
                  })}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ top: row3Top, zIndex: 2 }}>
                {weightSum !== 100 ? (
                  <Tooltip
                    title={t(translations.sumWarningTooltip, {
                      sum: weightSum,
                    })}
                  >
                    <span>
                      {t(translations.totalSubheader, { sum: weightSum })}
                      &nbsp;
                      <WarningAmberIcon color="warning" fontSize="inherit" />
                    </span>
                  </Tooltip>
                ) : (
                  t(translations.totalSubheader, { sum: weightSum })
                )}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.studentId}>
                <TableCell>{row.name}</TableCell>
                {tabs.map((tab) => (
                  <TableCell key={tab.id} align="right">
                    {formatPct(row.subtotalsByTabId[tab.id])}
                  </TableCell>
                ))}
                <TableCell align="right">{formatPct(row.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfigureWeightsDialog
        categories={categories}
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        tabs={tabs}
      />
    </div>
  );
};

export default GradebookWeightedTable;
