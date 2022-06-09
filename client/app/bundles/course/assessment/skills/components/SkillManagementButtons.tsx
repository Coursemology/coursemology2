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
import { deleteSkillBranch } from '../operations';

interface Props extends WrappedComponentProps {
  id: number;
  isBranch: boolean;
  canUpdate?: boolean;
  canDestroy?: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.achievement.delete.success',
    defaultMessage: 'Skill Branch was deleted.',
  },
  deletionFailure: {
    id: 'course.achievement.delete.fail',
    defaultMessage: 'Failed to delete skill branch.',
  },
});

const SkillManagementButtons: FC<Props> = (props) => {
  const { id, canUpdate, canDestroy, intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const onEdit = (): void => {
    navigate(`${getSkillsURL(getCourseId())}/edit`);
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteSkillBranch(id)) // check branch or skill
      .then(() => {
        toast.success(intl.formatMessage(translations.deletionSuccess));
          // navigate(`/courses/${getCourseId()}/achievements/`);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deletionFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
  };

  console.log(canUpdate, canDestroy)

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }}>
      <EditButton
        className={`branch-edit-${id}`}
        disabled={!canUpdate}
        onClick={onEdit}
      />
      <DeleteButton
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
