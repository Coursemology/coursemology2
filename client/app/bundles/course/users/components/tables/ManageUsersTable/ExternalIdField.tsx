import { memo } from 'react';
import equal from 'fast-deep-equal';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import { updateUser } from 'bundles/course/users/operations';
import InlineEditTextField from 'lib/components/form/fields/DataTableInlineEditable/TextField';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

interface ExternalIdFieldProps {
  for: CourseUserMiniEntity;
}

const ExternalIdField = (props: ExternalIdFieldProps): JSX.Element => {
  const { for: user } = props;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const handleIdUpdate = (id: string): Promise<void> => {
    return dispatch(updateUser(user.id, { externalId: id || null }))
      .then(() => {
        if (!id && user.externalId) {
          toast.success(t(translations.deleteIdSuccess));
        } else if (id && !user.externalId) {
          toast.success(t(translations.addIdSuccess, { newId: id }));
        } else {
          toast.success(
            t(translations.changeIdSuccess, {
              oldId: user.externalId ?? '',
              newId: id,
            }),
          );
        }
      })
      .catch((error) => {
        if (!id && user.externalId) {
          toast.error(t(translations.deleteIdFailure));
        } else if (id && !user.externalId) {
          toast.error(t(translations.addIdFailure, { newId: id }));
        } else {
          toast.error(
            t(translations.changeIdFailure, {
              oldId: user.externalId ?? '',
              newId: id,
            }),
          );
        }
        throw error;
      });
  };

  return (
    <InlineEditTextField
      key={user.id}
      allowEmpty
      className="course_user_external_id"
      onUpdate={(newId): Promise<void> => handleIdUpdate(newId)}
      updateValue={(): void => {}}
      value={user.externalId ?? ''}
      variant="standard"
    />
  );
};

export default memo(ExternalIdField, (prevProps, nextProps) =>
  equal(prevProps.for.externalId, nextProps.for.externalId),
);
