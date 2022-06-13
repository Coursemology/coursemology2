import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import EditButton from 'lib/components/buttons/EditButton';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getSkillsURL } from 'lib/helpers/url-builders';
import { deleteSkill, deleteSkillBranch } from '../operations';
import { SkillBranchData, SkillData } from 'types/course/assessment/skills/skills';

interface Props extends WrappedComponentProps {
  id: number;
  isBranch: boolean;
  canUpdate?: boolean;
  canDestroy?: boolean;
  editSkillClick: (data: SkillData) => void;
  editSkillBranchClick?: (data: SkillBranchData) => void;
  data: SkillBranchData | SkillData;
}

const translations = defineMessages({
  deleteBranchSuccess: {
    id: 'course.assessment.skills.components.SkillManagementButtons.deleteBranchSuccess',
    defaultMessage: 'Skill Branch was deleted.',
  },
  deleteBranchFailure: {
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
  deletionBranchConfirmation: {
    id: 'course.assessment.skills.components.SkillManagementButtons.deleteBranchConfirmation',
    defaultMessage: 'Are you sure you wish to delete this branch?',
  },
});

const SkillManagementButtons: FC<Props> = (props) => {
  const { id, canUpdate, canDestroy, intl, isBranch, data, editSkillClick, editSkillBranchClick } = props;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const onEdit = (): void => {
    if (isBranch && editSkillBranchClick) {
      editSkillBranchClick(data as SkillBranchData);
    } else {
      editSkillClick(data as SkillData);
    }
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    if (isBranch) {
      return dispatch(deleteSkillBranch(id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deleteBranchSuccess));
        navigate(getSkillsURL(getCourseId()));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deleteBranchFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
    } else {
      return dispatch(deleteSkill(id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deleteSkillSuccess));
        navigate(getSkillsURL(getCourseId()));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deleteSkillFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
    }
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }}>
      <EditButton
        className={`branch-edit-${id}`}
        disabled={!canUpdate}
        onClick={onEdit}
      />
      <DeleteButton
        message={isBranch ? intl.formatMessage(translations.deletionBranchConfirmation) : intl.formatMessage(translations.deletionSkillConfirmation)}
        className={`branch-delete-${id}`}
        disabled={!canDestroy && isDeleting}
        onClick={onDelete}
        withDialog
      />
    </div>
  );

  return managementButtons;
};

export default injectIntl(SkillManagementButtons);
