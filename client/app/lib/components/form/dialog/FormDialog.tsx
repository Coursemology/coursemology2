/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReactNode, useState } from 'react';
import { Control, FormState, useForm, UseFormSetError } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { AnyObjectSchema } from 'yup';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import ErrorText from 'lib/components/core/ErrorText';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

type Data = Record<string, any>;

interface Props {
  open: boolean;
  editing: boolean;
  initialValues: Data;
  onClose: () => void;
  onSubmit: (data, setError: UseFormSetError<Data>) => void;
  title: string;
  formName: string;
  validationSchema?: AnyObjectSchema;
  children?: (control: Control, formState: FormState<any>) => ReactNode;
  primaryActionText?: string;
}

const FormDialog = (props: Props): JSX.Element => {
  const {
    open,
    editing,
    initialValues,
    onClose,
    onSubmit,
    title,
    formName,
    validationSchema,
    children,
    primaryActionText,
  } = props;

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const { t } = useTranslation();
  const { control, handleSubmit, setError, formState } = useForm({
    defaultValues: initialValues,
    resolver: validationSchema && yupResolver(validationSchema),
  });

  const handleCloseDialog = (): void => {
    if (formState.isDirty) {
      setConfirmationDialogOpen(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        className="top-10"
        disableEnforceFocus={true}
        maxWidth="md"
        onClose={handleCloseDialog}
        open={open}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <form
            encType="multipart/form-data"
            id={formName}
            noValidate={true}
            onSubmit={handleSubmit((data) => onSubmit(data, setError))}
          >
            <ErrorText errors={formState.errors} />
            {children?.(control, formState)}
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            key="form-dialog-cancel-button"
            className="btn-cancel"
            color="secondary"
            disabled={formState.isSubmitting}
            onClick={handleCloseDialog}
          >
            {t(formTranslations.cancel)}
          </Button>
          <Button
            className="btn-submit"
            color="primary"
            disabled={formState.isSubmitting || !formState.isDirty}
            form={formName}
            id={
              editing
                ? 'form-dialog-update-button'
                : 'form-dialog-submit-button'
            }
            type="submit"
            variant="contained"
          >
            {primaryActionText ??
              (editing
                ? t(formTranslations.update)
                : t(formTranslations.submit))}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog
        confirmDiscard={true}
        onCancel={(): void => setConfirmationDialogOpen(false)}
        onConfirm={(): void => {
          setConfirmationDialogOpen(false);
          onClose();
        }}
        open={confirmationDialogOpen}
      />
    </>
  );
};

export default FormDialog;
