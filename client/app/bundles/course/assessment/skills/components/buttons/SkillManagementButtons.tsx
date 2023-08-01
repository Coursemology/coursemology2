import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  SkillBranchMiniEntity,
  SkillMiniEntity,
} from 'types/course/assessment/skills/skills';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import { deleteSkill, deleteSkillBranch } from '../../operations';

interface Props extends WrappedComponentProps {
  id: number;
  isSkillBranch: boolean;
  canUpdate?: boolean;
  canDestroy?: boolean;
  editClick: (data: SkillBranchMiniEntity | SkillMiniEntity) => void;
  data: SkillBranchMiniEntity | SkillMiniEntity;
  branchHasSkills: boolean;
}

const translations = defineMessages({
  deleteSkillBranchSuccess: {
    id: 'course.assessment.skills.SkillManagementButtons.deleteSkillBranchSuccess',
    defaultMessage: 'Skill branch was deleted.',
  },
  deleteSkillBranchFailure: {
    id: 'course.assessment.skills.SkillManagementButtons.deleteSkillBranchFailure',
    defaultMessage: 'Failed to delete skill branch.',
  },
  deleteSkillSuccess: {
    id: 'course.assessment.skills.SkillManagementButtons.deleteSkillSuccess',
    defaultMessage: 'Skill was deleted.',
  },
  deleteSkillFailure: {
    id: 'course.assessment.skills.SkillManagementButtons.deleteSkillFailure',
    defaultMessage: 'Failed to delete skill.',
  },
  deletionSkillConfirmation: {
    id: 'course.assessment.skills.SkillManagementButtons.deletionSkillConfirmation',
    defaultMessage: 'Are you sure you wish to delete this skill?',
  },
  deletionSkillBranchConfirmation: {
    id: 'course.assessment.skills.SkillManagementButtons.deletionSkillBranchConfirmation',
    defaultMessage: 'Are you sure you wish to delete this skill branch?',
  },
  deletionSkillBranchWithSkills: {
    id: 'course.assessment.skills.SkillManagementButtons.deletionSkillBranchWithSkills',
    defaultMessage:
      ' WARNING: There are skills in this skill branch which will also be deleted.',
  },
});

const SkillManagementButtons: FC<Props> = (props) => {
  const {
    id,
    canUpdate,
    canDestroy,
    intl,
    isSkillBranch,
    data,
    editClick,
    branchHasSkills,
  } = props;
  const dispatch = useAppDispatch();
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

  let message = isSkillBranch
    ? intl.formatMessage(translations.deletionSkillBranchConfirmation)
    : intl.formatMessage(translations.deletionSkillConfirmation);

  if (branchHasSkills) {
    message += intl.formatMessage(translations.deletionSkillBranchWithSkills);
  }

  return (
    <div style={{ whiteSpace: 'nowrap', textAlign: 'end' }}>
      {canUpdate && (
        <EditButton
          className={
            isSkillBranch ? `skill-branch-edit-${id}` : `skill-edit-${id}`
          }
          disabled={!canUpdate || isDeleting}
          onClick={(): void => editClick(data)}
        />
      )}
      {canDestroy && (
        <DeleteButton
          className={
            isSkillBranch ? `skill-branch-delete-${id}` : `skill-delete-${id}`
          }
          confirmMessage={message}
          disabled={isDeleting}
          loading={isDeleting}
          onClick={onDelete}
        />
      )}
    </div>
  );
};

export default injectIntl(SkillManagementButtons);
