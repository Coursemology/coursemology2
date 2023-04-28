import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

interface SubmitWarningDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SubmitWarningDialog = (props: SubmitWarningDialogProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      message={t(translations.submitConfirmation)}
      onCancel={props.onClose}
      onConfirm={(): void => {
        props.onConfirm();
        props.onClose();
      }}
      open={props.open}
    />
  );
};

export default SubmitWarningDialog;
