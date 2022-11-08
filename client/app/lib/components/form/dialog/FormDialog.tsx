/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, ReactNode } from 'react';
import { Control, FormState, useForm, UseFormSetError } from 'react-hook-form';
import { AnyObjectSchema } from 'yup';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import ErrorText from 'lib/components/core/ErrorText';
import { yupResolver } from '@hookform/resolvers/yup';
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
        disableEnforceFocus
        onClose={handleCloseDialog}
        open={open}
        maxWidth="lg"
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <form
            encType="multipart/form-data"
            id={formName}
            noValidate
            onSubmit={handleSubmit((data) => onSubmit(data, setError))}
          >
            <ErrorText errors={formState.errors} />
            {children?.(control, formState)}
          </form>
        </DialogContent>
        <DialogActions className="flex justify-end">
          <Button
            color="secondary"
            className="btn-cancel"
            disabled={formState.isSubmitting}
            key="form-dialog-cancel-button"
            onClick={handleCloseDialog}
          >
            {t(formTranslations.cancel)}
          </Button>
          <Button
            id={
              editing
                ? 'form-dialog-update-button'
                : 'form-dialog-submit-button'
            }
            variant="contained"
            color="primary"
            className="btn-submit"
            disabled={formState.isSubmitting || !formState.isDirty}
            form={formName}
            type="submit"
          >
            {editing ? t(formTranslations.update) : t(formTranslations.submit)}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog
        confirmDiscard
        open={confirmationDialogOpen}
        onCancel={(): void => setConfirmationDialogOpen(false)}
        onConfirm={(): void => {
          setConfirmationDialogOpen(false);
          onClose();
        }}
      />
    </>
  );
};

export default FormDialog;
