import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { AppDispatch } from 'types/store';
import {
  SkillBranchOptions,
  SkillFormData,
  SkillMiniEntity,
  SkillBranchMiniEntity,
} from 'types/course/assessment/skills/skills';
import { DialogTypes } from '../../types';
import SkillForm from '../forms/SkillForm';
import {
  createSkill,
  createSkillBranch,
  updateSkill,
  updateSkillBranch,
} from '../../operations';

interface Props extends WrappedComponentProps {
  dialogType: DialogTypes;
  open: boolean;
  handleClose: () => void;
  skillBranchOptions: SkillBranchOptions[];
  data?: SkillMiniEntity | SkillBranchMiniEntity | null;
  skillBranchId: number;
  setNewSelected: (branchId: number, skillId?: number) => void;
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
  editSkill: {
    id: 'course.assessment.skills.components.SkillDialog.newSkill',
    defaultMessage: 'Edit Skill',
  },
  editSkillBranch: {
    id: 'course.assessment.skills.components.SkillDialog.newSkill',
    defaultMessage: 'Edit Skill Branch',
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
  const {
    open,
    handleClose,
    intl,
    dialogType,
    skillBranchOptions,
    data,
    skillBranchId,
    setNewSelected,
  } = props;
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  if (!open) {
    return null;
  }

  if (dialogType === DialogTypes.EditSkill && data) {
    const newData = data as SkillMiniEntity;
    initialValues.title = newData.title ?? '';
    initialValues.description = newData.description ?? '';
    initialValues.skillBranchId = newData.branchId ? newData.branchId : null;
  } else if (dialogType === DialogTypes.EditSkillBranch && data) {
    const newData = data as SkillBranchMiniEntity;
    initialValues.title = newData.title ?? '';
    initialValues.description = newData.description ?? '';
  } else {
    initialValues.title = '';
    initialValues.description = '';
    initialValues.skillBranchId = skillBranchId !== -1 ? skillBranchId : null;
  }

  const onSubmit = (formData: SkillFormData, setError): Promise<void> => {
    switch (dialogType) {
      case DialogTypes.NewSkill:
        return dispatch(createSkill(formData))
          .then((response) => {
            toast.success(intl.formatMessage(translations.createSkillSuccess));
            setTimeout(() => {
              if (response.data?.id) {
                handleClose();
                setNewSelected(response.data.branchId ?? -1, response.data.id);
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
            toast.success(
              intl.formatMessage(translations.createSkillBranchSuccess),
            );
            setTimeout(() => {
              if (response.data?.id) {
                handleClose();
                setNewSelected(response.data.id ?? -1);
              }
            }, 200);
          })
          .catch((error) => {
            toast.error(
              intl.formatMessage(translations.createSkillBranchFailure),
            );
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
            toast.success(
              intl.formatMessage(translations.updateSkillBranchSuccess),
            );
            setTimeout(() => {
              if (response.data?.id) {
                handleClose();
              }
            }, 200);
          })
          .catch((error) => {
            toast.error(
              intl.formatMessage(translations.updateSkillBranchFailure),
            );
            if (error.response?.data) {
              setReactHookFormError(setError, error.response.data.errors);
            }
            throw error;
          });
      default:
        return Promise.reject();
    }
  };

  let title = '';
  switch (dialogType) {
    case DialogTypes.NewSkill:
      title = intl.formatMessage(translations.newSkill);
      break;
    case DialogTypes.NewSkillBranch:
      title = intl.formatMessage(translations.newSkillBranch);
      break;
    case DialogTypes.EditSkill:
      title = intl.formatMessage(translations.editSkill);
      break;
    case DialogTypes.EditSkillBranch:
      title = intl.formatMessage(translations.editSkillBranch);
      break;
    default:
      break;
  }

  return (
    <>
      <Dialog
        disableEnforceFocus
        onClose={(): void => {
          if (isDirty) {
            setConfirmationDialogOpen(true);
          } else {
            handleClose();
          }
        }}
        open={open}
        maxWidth="lg"
        style={{
          top: 40,
        }}
      >
        <DialogTitle>{title}</DialogTitle>
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
            skillBranchOptions={skillBranchOptions}
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
