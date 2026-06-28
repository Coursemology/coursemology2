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

interface Props {
  /** Match the host toolbar's button size. Defaults to MUI's `medium`. */
  size?: 'small' | 'medium';
}

const ManageExternalAssessmentsButton: FC<Props> = ({ size }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size={size} variant="outlined">
        {t(translations.manage)}
      </Button>
      <ManageExternalAssessmentsPanel
        onClose={() => setOpen(false)}
        open={open}
      />
    </>
  );
};

export default ManageExternalAssessmentsButton;
