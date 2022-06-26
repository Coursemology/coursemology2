import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import EditButton from 'lib/components/buttons/EditButton';
import {
  SkillBranchMiniEntity,
  SkillMiniEntity,
} from 'types/course/assessment/skills/skills';
import { deleteSkill, deleteSkillBranch } from '../../operations';

interface Props extends WrappedComponentProps {
  id: number;
  isSkillBranch: boolean;
  canUpdate?: boolean;
  canDestroy?: boolean;
  editClick: (data: SkillBranchMiniEntity | SkillMiniEntity) => void;
  data: SkillBranchMiniEntity | SkillMiniEntity;
}

const translations = defineMessages({
  deleteSkillBranchSuccess: {
    id: 'course.assessment.skills.components.SkillManagementButtons.deleteBranchSuccess',
    defaultMessage: 'Skill branch was deleted.',
  },
  deleteSkillBranchFailure: {
    id: 'course.assessment.skills.components.SkillManagementButtons.deleteBranchFailure',
    defaultMessage: 'Failed to delete skill branch.',
  },
  deleteSkillSuccess: {
    id: 'course.assessment.skills.components.SkillManagementButtons.deleteSkillSuccess',
    defaultMessage: 'Skill was deleted.',
  },
  deleteSkillFailure: {
    id: 'course.assessment.skills.components.SkillManagementButtons.deleteSkillFailure',
    defaultMessage: 'Failed to delete skill.',
  },
  deletionSkillConfirmation: {
    id: 'course.assessment.skills.components.SkillManagementButtons.deleteSkillConfirmation',
    defaultMessage: 'Are you sure you wish to delete this skill?',
  },
  deletionSkillBranchConfirmation: {
    id: 'course.assessment.skills.components.SkillManagementButtons.deleteBranchConfirmation',
    defaultMessage: 'Are you sure you wish to delete this skill branch?',
  },
});

const SkillManagementButtons: FC<Props> = (props) => {
  const { id, canUpdate, canDestroy, intl, isSkillBranch, data, editClick } =
    props;
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!canUpdate && !canDestroy) {
    return null;
  }

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    if (isSkillBranch) {
      return dispatch(deleteSkillBranch(id))
        .then(() => {
          toast.success(
            intl.formatMessage(translations.deleteSkillBranchSuccess),
          );
        })
        .catch((error) => {
          toast.error(
            intl.formatMessage(translations.deleteSkillBranchFailure),
          );
          throw error;
        })
        .finally(() => setIsDeleting(false));
    }
    return dispatch(deleteSkill(id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deleteSkillSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deleteSkillFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap', textAlign: 'end' }}>
      {canUpdate && (
        <EditButton
          className={
            isSkillBranch ? `skill-branch-edit-${id}` : `skill-edit-${id}`
          }
          disabled={!canUpdate}
          onClick={(): void => editClick(data)}
        />
      )}
      {canDestroy && (
        <DeleteButton
          message={
            isSkillBranch
              ? intl.formatMessage(translations.deletionSkillBranchConfirmation)
              : intl.formatMessage(translations.deletionSkillConfirmation)
          }
          className={
            isSkillBranch ? `skill-branch-delete-${id}` : `skill-delete-${id}`
          }
          disabled={isDeleting}
          onClick={onDelete}
          withDialog
        />
      )}
    </div>
  );

  return managementButtons;
};

export default injectIntl(SkillManagementButtons);
