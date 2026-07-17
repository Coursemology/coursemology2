import { useState } from 'react';
import { Card, CardContent, ListSubheader } from '@mui/material';

import DuplicationAssessmentTree from 'course/duplication/components/DuplicationAssessmentTree';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { duplicateListings } from '../operations';
import translations from '../translations';
import { MarketplaceListing } from '../types';

interface Props {
  listings: Pick<MarketplaceListing, 'id' | 'title'>[];
  destinationTabId: number | null;
  destinationCourse: { title: string; url: string };
  destinationCategory: { id: number; title: string } | null;
  destinationTab: { id: number; title: string } | null;
  open: boolean;
  onClose: () => void;
}

const DuplicateConfirmation = ({
  listings,
  destinationTabId,
  destinationCourse,
  destinationCategory,
  destinationTab,
  open,
  onClose,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const confirm = async (): Promise<void> => {
    setSubmitting(true);
    await duplicateListings(
      listings.map((l) => l.id),
      destinationTabId,
      () => {
        toast.success(t(translations.duplicateStarted, { n: listings.length }));
        setSubmitting(false);
        onClose();
      },
      () => {
        toast.error(t(translations.duplicateFailed, { n: listings.length }));
        setSubmitting(false);
      },
    );
  };

  return (
    <Prompt
      disabled={submitting}
      onClickPrimary={confirm}
      onClose={onClose}
      open={open}
      primaryLabel={t(translations.duplicateConfirm)}
      title={t(translations.confirmationQuestion)}
    >
      <ListSubheader disableSticky>
        {t(translations.destinationCourse)}
      </ListSubheader>
      <Card>
        <CardContent>
          <Link opensInNewTab to={destinationCourse.url} variant="h6">
            {destinationCourse.title}
          </Link>
        </CardContent>
      </Card>

      <ListSubheader disableSticky>
        {t(translations.assessmentsHeading)}
      </ListSubheader>
      <DuplicationAssessmentTree
        nodes={[
          {
            category: destinationCategory,
            tabs: [{ tab: destinationTab, assessments: listings }],
          },
        ]}
      />
    </Prompt>
  );
};

export default DuplicateConfirmation;
