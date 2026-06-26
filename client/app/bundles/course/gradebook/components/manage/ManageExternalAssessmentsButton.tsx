import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import ManageExternalAssessmentsPanel from './ManageExternalAssessmentsPanel';

const translations = defineMessages({
  manage: {
    id: 'course.gradebook.ManageExternalAssessmentsButton.label',
    defaultMessage: 'Manage external assessments',
  },
});

const ManageExternalAssessmentsButton: FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="small" variant="outlined">
        {t(translations.manage)}
      </Button>
      <ManageExternalAssessmentsPanel onClose={() => setOpen(false)} open={open} />
    </>
  );
};

export default ManageExternalAssessmentsButton;
