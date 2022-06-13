import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { AppDispatch } from 'types/store';
import { DialogTypes } from '../types';
import SkillForm from './SkillForm';
import { BranchOptions, SkillBranchData, SkillBranchFormData, SkillData, SkillFormData, SkillSettings } from 'types/course/assessment/skills/skills';
import { createSkill, createSkillBranch, updateSkill, updateSkillBranch } from '../operations';

interface Props extends WrappedComponentProps {
  dialogType: DialogTypes;
  open: boolean;
  handleClose: () => any;
  settings: SkillSettings;
  branchOptions: BranchOptions[];
  data?: SkillData | SkillBranchData | null;
}

const translations = defineMessages({
  newSkill: {
    id: 'course.assessment.skills.components.SkillDialog.newSkill',
    defaultMessage: 'New Skill',
  },
  newSkillBranch: {
    id: 'course.assessment.skills.components.SkillDialog.newSkill',
    defaultMessage: 'New Skill Branch',
  },
  createSkillSuccess: {
    id: 'course.assessment.skills.components.SkillDialog.createSkillSuccess',
    defaultMessage: 'Skill was created.',
  },
  createSkillFailure: {
    id: 'course.assessment.skills.components.SkillDialog.createSkillFailure',
    defaultMessage: 'Failed to create skill.',
  },
  createSkillBranchSuccess: {
    id: 'course.assessment.skills.components.SkillDialog.createSkillBranchSuccess',
    defaultMessage: 'Skill branch was created.',
  },
  createSkillBranchFailure: {
    id: 'course.assessment.skills.components.SkillDialog.createSkillBranchFailure',
    defaultMessage: 'Failed to create skill branch.',
  },
  updateSkillSuccess: {
    id: 'course.assessment.skills.components.SkillDialog.updateSkillSuccess',
    defaultMessage: 'Skill was updated.',
  },
  updateSkillFailure: {
    id: 'course.assessment.skills.components.SkillDialog.updateSkillFailure',
    defaultMessage: 'Failed to update skill.',
  },
  updateSkillBranchSuccess: {
    id: 'course.assessment.skills.components.SkillDialog.updateSkillBranchSuccess',
    defaultMessage: 'Skill branch was update.',
  },
  updateSkillBranchFailure: {
    id: 'course.assessment.skills.components.SkillDialog.updateSkillBranchFailure',
    defaultMessage: 'Failed to update skill branch.',
  },
});

const initialValues: SkillFormData = {
  title: '',
  description: '',
};

const SkillDialog: FC<Props> = (props) => {
  const { open, handleClose, intl, dialogType, settings, branchOptions, data } = props;
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  if (dialogType === DialogTypes.EditSkill && data) {
    const newData = data as SkillData;
    initialValues.title = newData.title ?? "";
    initialValues.description = newData.description ?? "";
    initialValues.skill_branch_id = newData.branchId ?? -1
  } else if (dialogType === DialogTypes.EditSkillBranch && data) {
    const newData = data as SkillBranchData;
    initialValues.title = newData.title ?? "";
    initialValues.description = newData.description ?? "";
  } else {
    initialValues.title = "";
    initialValues.description = "";
  }

  if (!open) {
    return null;
  }

  const onSubmit = (formData: SkillFormData | SkillBranchFormData, setError): Promise<void> => {
    switch (dialogType) {
      case DialogTypes.NewSkill:
        return dispatch(createSkill(formData))
        .then((response) => {
          toast.success(intl.formatMessage(translations.createSkillSuccess));
          setTimeout(() => {
            if (response.data?.id) {
              handleClose();
            }
          }, 200);
        })
        .catch((error) => {
          toast.error(intl.formatMessage(translations.createSkillFailure));
          if (error.response?.data) {
            setReactHookFormError(setError, error.response.data.errors);
          }
          throw error;
        });
      case DialogTypes.NewSkillBranch:
        return dispatch(createSkillBranch(formData))
        .then((response) => {
          toast.success(intl.formatMessage(translations.createSkillBranchSuccess));
          setTimeout(() => {
            if (response.data?.id) {
              handleClose();
            }
          }, 200);
        })
        .catch((error) => {
          toast.error(intl.formatMessage(translations.createSkillBranchFailure));
          if (error.response?.data) {
            setReactHookFormError(setError, error.response.data.errors);
          }
          throw error;
        });
        case DialogTypes.EditSkill:
          return dispatch(updateSkill(data?.id ?? -1, formData))
          .then((response) => {
            toast.success(intl.formatMessage(translations.updateSkillSuccess));
            setTimeout(() => {
              if (response.data?.id) {
                handleClose();
              }
            }, 200);
          })
          .catch((error) => {
            toast.error(intl.formatMessage(translations.updateSkillFailure));
            if (error.response?.data) {
              setReactHookFormError(setError, error.response.data.errors);
            }
            throw error;
          });
        case DialogTypes.EditSkillBranch:
          return dispatch(updateSkillBranch(data?.id ?? -1, formData))
          .then((response) => {
            toast.success(intl.formatMessage(translations.updateSkillBranchSuccess));
            setTimeout(() => {
              if (response.data?.id) {
                handleClose();
              }
            }, 200);
          })
          .catch((error) => {
            toast.error(intl.formatMessage(translations.updateSkillBranchFailure));
            if (error.response?.data) {
              setReactHookFormError(setError, error.response.data.errors);
            }
            throw error;
          });
      default:
        return Promise.reject();
    }
  }


  return (
    <>
      <Dialog
        onClose={(): void => {
          if (isDirty) {
            setConfirmationDialogOpen(true);
          } else {
            handleClose();
          }
        }}
        open={open}
        maxWidth="xl"
      >
        <DialogTitle>
          {dialogType === DialogTypes.NewSkill ? intl.formatMessage(translations.newSkill) : intl.formatMessage(translations.newSkillBranch)}
        </DialogTitle>
        <DialogContent>
          <SkillForm
            handleClose={(): void => {
              if (isDirty) {
                setConfirmationDialogOpen(true);
              } else {
                handleClose();
              }
            }}
            initialValues={initialValues}
            onSubmit={onSubmit}
            setIsDirty={setIsDirty}
            settings={settings}
            branchOptions={branchOptions}
            dialogType={dialogType}
          />
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        confirmDiscard
        open={confirmationDialogOpen}
        onCancel={(): void => setConfirmationDialogOpen(false)}
        onConfirm={(): void => {
          setConfirmationDialogOpen(false);
          handleClose();
        }}
      />
    </>
  );
};

export default injectIntl(SkillDialog);
