import { useState } from 'react';
import { Button } from '@mui/material';
import { AssessmentData } from 'types/course/assessment/assessments';

import CourseAPI from 'api/course';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

interface Props {
  assessment: Pick<
    AssessmentData,
    'id' | 'isPublishedToMarketplace' | 'permissions'
  >;
  onChange: (published: boolean) => void;
}

const PublishToMarketplaceButton = ({
  assessment,
  onChange,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const listed = assessment.isPublishedToMarketplace;

  if (!assessment.permissions.canPublishToMarketplace) return null;

  const confirm = async (): Promise<void> => {
    setSubmitting(true);
    try {
      if (listed) {
        await CourseAPI.marketplace.removeListing(assessment.id);
        toast.success(t(translations.removed));
        onChange(false);
      } else {
        await CourseAPI.marketplace.publishListing(assessment.id);
        toast.success(t(translations.published));
        onChange(true);
      }
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        color={listed ? 'error' : 'primary'}
        onClick={(): void => setOpen(true)}
        variant="outlined"
      >
        {t(listed ? translations.remove : translations.publish)}
      </Button>
      <Prompt
        disabled={submitting}
        onClickPrimary={confirm}
        onClose={(): void => setOpen(false)}
        open={open}
        primaryColor={listed ? 'error' : 'primary'}
        primaryLabel={t(listed ? translations.remove : translations.publish)}
        title={t(
          listed
            ? translations.removeConfirmTitle
            : translations.publishConfirmTitle,
        )}
      >
        <PromptText>
          {t(
            listed
              ? translations.removeConfirmBody
              : translations.publishConfirmBody,
          )}
        </PromptText>
      </Prompt>
    </>
  );
};

export default PublishToMarketplaceButton;
