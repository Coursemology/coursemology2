import { memo } from 'react';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import { updateUser } from 'bundles/course/users/operations';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface UserNameFieldProps {
  for: CourseUserMiniEntity;
  submitting: boolean;
  setSubmitting: (status: boolean) => void;
}

const UserNameField = (props: UserNameFieldProps): JSX.Element => {
  const { for: user, submitting, setSubmitting } = props;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const handleNameUpdate = (name: string): Promise<void> => {
    setSubmitting(true);

    return dispatch(updateUser(user.id, { name }))
      .then(() => {
        toast.success(
          t(translations.renameSuccess, {
            oldName: user.name,
            newName: name,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.renameFailure, {
            oldName: user.name,
            newName: name,
            error: error.response?.data?.errors ?? '',
          }),
        );
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <InlineEditTextField
      key={user.id}
      className="course_user_name"
      disabled={submitting}
      onUpdate={(newName): Promise<void> => handleNameUpdate(newName)}
      updateValue={(): void => {}}
      value={user.name}
      variant="standard"
    />
  );
};

export default memo(
  UserNameField,
  (prevProps, nextProps) =>
    equal(prevProps.for.name, nextProps.for.name) &&
    prevProps.submitting === nextProps.submitting,
);
