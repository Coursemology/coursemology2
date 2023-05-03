import Prompt from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import translations from '../../../../translations';

interface SubmitWarningDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SubmitWarningDialog = (props: SubmitWarningDialogProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Prompt
      onClickPrimary={(): void => {
        props.onConfirm();
        props.onClose();
      }}
      onClose={props.onClose}
      open={props.open}
      primaryLabel={t(formTranslations.continue)}
    >
      {t(translations.submitConfirmation)}
    </Prompt>
  );
};

export default SubmitWarningDialog;
