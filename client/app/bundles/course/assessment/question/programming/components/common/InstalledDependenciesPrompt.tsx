import { Typography } from '@mui/material';
import { LanguageDependencyData } from 'types/course/assessment/question/programming';

import Prompt from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import InstalledDependenciesTable from './InstalledDependenciesTable';

interface InstalledDependenciesProps {
  disabled?: boolean;
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  dependencies: LanguageDependencyData[];
}

const InstalledDependenciesPrompt = (
  props: InstalledDependenciesProps,
): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Prompt
      cancelColor="info"
      cancelLabel={t(formTranslations.close)}
      disabled={props.disabled}
      maxWidth="lg"
      onClose={props.onClose}
      open={props.open}
      title={props.title}
    >
      <Typography variant="body2"> {props.description} </Typography>

      <InstalledDependenciesTable
        className="mt-2"
        dependencies={props.dependencies}
      />
    </Prompt>
  );
};

export default InstalledDependenciesPrompt;
