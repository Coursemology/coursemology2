import { createElement } from 'react';
import { toast } from 'react-toastify';
import { Create, Delete } from '@mui/icons-material';
import { IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { ConditionData, ConditionsData } from 'types/course/conditions';

import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';

import specify from './specifiers';
import translations from './translations';

interface ConditionProps<AnyConditionData extends ConditionData> {
  condition: AnyConditionData;
  otherConditions: Set<number>;
  onUpdate: (
    data: Partial<ConditionData>,
    onSuccess?: () => void,
    onError?: (error) => void,
  ) => void;
  onDelete: (url: ConditionData['url']) => Promise<void | ConditionsData[]>;
}

/**
 * A table row used by `ConditionsManager` to display an unlock condition.
 *
 * Accepts a generic `condition` that will be mapped to a presentable `Dialog`
 * of generic type `AnyCondition` for editing the `condition` of the generic
 * `AnyConditionData` type.
 */
const ConditionRow = <AnyConditionData extends ConditionData>(
  props: ConditionProps<AnyConditionData>,
): JSX.Element => {
  const { t } = useTranslation();
  const [editing, toggleEditing] = useToggle(false);
  const { component } = specify(props.condition.type);

  const updateCondition = (
    data: ConditionData,
    onError?: (errors) => void,
  ): void => {
    props.onUpdate(data, toggleEditing, onError);
  };

  const deleteCondition = (): void => {
    props
      .onDelete(props.condition.url)
      .catch(() =>
        toast.error(t(translations.errorOccurredWhenDeletingCondition)),
      );
  };

  return (
    <TableRow className="group" hover>
      <TableCell className="w-48 group-last:border-0">
        <Typography variant="body2">{props.condition.type}</Typography>
      </TableCell>

      <TableCell className="flex items-center justify-between group-last:border-0">
        <div className="mr-8 flex w-full items-center">
          <Typography variant="body2">{props.condition.description}</Typography>
        </div>

        <div className="hoverable:invisible group-hover?:visible flex items-center">
          {editing ? (
            createElement(component, {
              condition: props.condition,
              open: editing,
              otherConditions: props.otherConditions,
              onUpdate: updateCondition,
              onClose: toggleEditing,
            })
          ) : (
            <IconButton onClick={toggleEditing}>
              <Create />
            </IconButton>
          )}

          <IconButton color="error" onClick={deleteCondition}>
            <Delete />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ConditionRow;
