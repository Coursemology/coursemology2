import { ChangeEventHandler, forwardRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Inventory, Upload } from '@mui/icons-material';
import { Alert, Button, Typography } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import InfoLabel from 'lib/components/core/InfoLabel';
import Subsection from 'lib/components/core/layouts/Subsection';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

type Attached<T> = [T, File];
type MaybeAttached<T> = T | Attached<T>;

const attach = <T,>(thing: T, file: File): Attached<T> => [thing, file];

const detach = <T,>(attached: Attached<T>): T => attached[0];

export const isAttached = <T,>(thing: MaybeAttached<T>): thing is Attached<T> =>
  Array.isArray(thing) && thing.length === 2;

export const unwrap = <T,>(thing: MaybeAttached<T>): T =>
  isAttached(thing) ? thing[0] : thing;

export const attachment = <T,>(attached: Attached<T>): File => attached[1];

interface PackageUploaderProps {
  disabled?: boolean;
}

interface UploadButtonProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

const UploadButton = forwardRef<HTMLInputElement, UploadButtonProps>(
  (props, ref): JSX.Element => {
    const { t } = useTranslation();

    const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      if (props.disabled) return;

      e.preventDefault();

      const files = e.target.files;
      if (!files?.length) return;

      const file = files[0];
      if (!file.name.endsWith('.zip')) return;

      props.onUpload(files[0]);

      e.target.value = '';
    };

    return (
      <Button
        disabled={props.disabled}
        startIcon={<Upload />}
        variant="outlined"
      >
        {t(translations.uploadNewPackage)}

        <input
          ref={ref}
          accept="application/zip"
          className="absolute bottom-0 left-0 right-0 top-0 cursor-pointer opacity-0"
          disabled={props.disabled}
          onChange={handleFileInputChange}
          type="file"
        />
      </Button>
    );
  },
);

UploadButton.displayName = 'UploadButton';

const PackageUploader = (props: PackageUploaderProps): JSX.Element => {
  const { control } = useFormContext<ProgrammingFormData>();

  const { t } = useTranslation();

  return (
    <Subsection
      className="!mt-10"
      spaced
      subtitle={t(translations.uploadNewPackageHint)}
      title={t(translations.uploadNewPackage)}
    >
      <Controller
        control={control}
        name="question.package"
        render={({
          field: { onChange, value, ref },
          fieldState: { error },
        }): JSX.Element => (
          <>
            <UploadButton
              ref={ref}
              disabled={props.disabled}
              onUpload={(file): void => onChange(attach(unwrap(value), file))}
            />

            {error && (
              <Typography color="error" variant="body2">
                {error.message}
              </Typography>
            )}

            {isAttached(value) ? (
              <Alert
                classes={{ message: 'break-all' }}
                color="info"
                componentsProps={{ closeButton: { disabled: props.disabled } }}
                icon={<Inventory />}
                onClose={(): void => onChange(detach(value))}
              >
                {attachment(value).name}
              </Alert>
            ) : (
              <InfoLabel label={t(translations.packageIsZipOnly)} />
            )}
          </>
        )}
      />
    </Subsection>
  );
};

export default PackageUploader;
