import { Controller, useFormContext } from 'react-hook-form';
import { RadioGroup } from '@mui/material';
import {
  LanguageData,
  ProgrammingFormData,
} from 'types/course/assessment/question/programming';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { useProgrammingFormDataContext } from '../../hooks/ProgrammingFormDataContext';
import ImportResult from '../common/ImportResult';
import PackageInfo from '../common/PackageInfo';
import PackageUploader from '../common/PackageUploader';
import PolyglotEditor from '../package/PolyglotEditor';

export const PACKAGE_SECTION_ID = 'package-fields' as const;

interface PackageFieldsProps {
  getDataFromId: (id: number) => LanguageData;
  disabled?: boolean;
}

const PackageFields = (props: PackageFieldsProps): JSX.Element => {
  const { t } = useTranslation();

  const { control, watch } = useFormContext<ProgrammingFormData>();

  const { question, importResult } = useProgrammingFormDataContext();

  const autograded = watch('question.autograded');
  const editOnline = watch('question.editOnline');
  const languageId = watch('question.languageId');

  const canSwitchPackageType = question.canSwitchPackageType;
  const packageInfo = question.package;

  return (
    <>
      {autograded && (
        <Section
          id={PACKAGE_SECTION_ID}
          sticksToNavbar
          title="Evaluation package"
        >
          <Subsection
            subtitle={t(translations.packageCreationModeHint)}
            title={t(translations.packageCreationMode)}
          >
            <Controller
              control={control}
              name="question.editOnline"
              render={({ field }): JSX.Element => (
                <RadioGroup
                  className="space-y-5"
                  onChange={(e): void =>
                    field.onChange(e.target.value === 'online')
                  }
                  value={field.value ? 'online' : 'upload'}
                >
                  <RadioButton
                    className="my-0"
                    description={t(translations.editOnlineHint)}
                    disabled={!canSwitchPackageType || props.disabled}
                    label={t(translations.editOnline)}
                    value="online"
                  />

                  <RadioButton
                    className="my-0"
                    description={t(translations.uploadPackageHint)}
                    disabled={!canSwitchPackageType || props.disabled}
                    label={t(translations.uploadPackage)}
                    value="upload"
                  />
                </RadioGroup>
              )}
            />
          </Subsection>

          {!editOnline && <PackageUploader disabled={props.disabled} />}

          {packageInfo && (
            <Subsection
              className="!mt-10"
              spaced
              subtitle={
                editOnline
                  ? t(translations.packageInfoOnlineHint)
                  : t(translations.packageInfoUploadHint)
              }
              title={
                editOnline
                  ? t(translations.packageInfoOnline)
                  : t(translations.packageInfoUpload)
              }
            >
              <PackageInfo disabled={props.disabled} of={packageInfo} />
            </Subsection>
          )}

          {importResult && (
            <ImportResult disabled={props.disabled} of={importResult} />
          )}
        </Section>
      )}

      {languageId && (
        <PolyglotEditor
          disabled={props.disabled}
          languageMode={props.getDataFromId(languageId)?.editorMode}
        />
      )}
    </>
  );
};

export default PackageFields;
