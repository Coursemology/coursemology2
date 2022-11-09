import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  SkillBranchMiniEntity,
  SkillBranchOptions,
  SkillFormData,
  SkillMiniEntity,
} from 'types/course/assessment/skills/skills';
import { AppDispatch } from 'types/store';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import {
  createSkill,
  createSkillBranch,
  updateSkill,
  updateSkillBranch,
} from '../../operations';
import { DialogTypes } from '../../types';
import SkillForm from '../forms/SkillForm';

interface Props {
  dialogType: DialogTypes;
  open: boolean;
  onClose: () => void;
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
    defaultMessage: 'Skill branch was updated.',
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
    onClose,
    dialogType,
    skillBranchOptions,
    data,
    skillBranchId,
    setNewSelected,
  } = props;
  const { t } = useTranslation();
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
            toast.success(t(translations.createSkillSuccess));
            setTimeout(() => {
              if (response.data?.id) {
                onClose();
                setNewSelected(response.data.branchId ?? -1, response.data.id);
              }
            }, 200);
          })
          .catch((error) => {
            toast.error(t(translations.createSkillFailure));
            if (error.response?.data) {
              setReactHookFormError(setError, error.response.data.errors);
            }
          });
      case DialogTypes.NewSkillBranch:
        return dispatch(createSkillBranch(formData))
          .then((response) => {
            toast.success(t(translations.createSkillBranchSuccess));
            setTimeout(() => {
              if (response.data?.id) {
                onClose();
                setNewSelected(response.data.id ?? -1);
              }
            }, 200);
          })
          .catch((error) => {
            toast.error(t(translations.createSkillBranchFailure));
            if (error.response?.data) {
              setReactHookFormError(setError, error.response.data.errors);
            }
          });
      case DialogTypes.EditSkill:
        return dispatch(updateSkill(data?.id ?? -1, formData))
          .then((response) => {
            toast.success(t(translations.updateSkillSuccess));
            setTimeout(() => {
              if (response.data?.id) {
                onClose();
              }
            }, 200);
          })
          .catch((error) => {
            toast.error(t(translations.updateSkillFailure));
            if (error.response?.data) {
              setReactHookFormError(setError, error.response.data.errors);
            }
          });
      case DialogTypes.EditSkillBranch:
        return dispatch(updateSkillBranch(data?.id ?? -1, formData))
          .then((response) => {
            toast.success(t(translations.updateSkillBranchSuccess));
            setTimeout(() => {
              if (response.data?.id) {
                onClose();
              }
            }, 200);
          })
          .catch((error) => {
            toast.error(t(translations.updateSkillBranchFailure));
            if (error.response?.data) {
              setReactHookFormError(setError, error.response.data.errors);
            }
          });
      default:
        return Promise.reject();
    }
  };

  let title = '';
  switch (dialogType) {
    case DialogTypes.NewSkill:
      title = t(translations.newSkill);
      break;
    case DialogTypes.NewSkillBranch:
      title = t(translations.newSkillBranch);
      break;
    case DialogTypes.EditSkill:
      title = t(translations.editSkill);
      break;
    case DialogTypes.EditSkillBranch:
      title = t(translations.editSkillBranch);
      break;
    default:
      break;
  }

  return (
    <SkillForm
      dialogType={dialogType}
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      skillBranchOptions={skillBranchOptions}
      title={title}
    />
  );
};

export default SkillDialog;
