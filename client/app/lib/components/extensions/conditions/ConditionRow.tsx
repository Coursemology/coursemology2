import { createElement, useState } from 'react';
import { Create, Delete } from '@mui/icons-material';
import { IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { ConditionData, ConditionsData } from 'types/course/conditions';

import toast from 'lib/hooks/toast';
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
  const [editing, setEditing] = useState(false);
  const { component, defaultDisplayName } = specify(props.condition.type);

  const updateCondition = (
    data: ConditionData,
    onError?: (errors) => void,
  ): void => {
    props.onUpdate(data, (): void => setEditing(false), onError);
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
        <Typography variant="body2">
          {props.condition.displayName || t(defaultDisplayName)}
        </Typography>
      </TableCell>

      <TableCell className="flex items-center justify-between group-last:border-0">
        <div className="mr-8 flex w-full items-center">
          <Typography variant="body2">{props.condition.description}</Typography>
        </div>

        <div className="flex items-center hoverable:invisible group-hover?:visible">
          {editing ? (
            createElement(component, {
              condition: props.condition,
              open: editing,
              otherConditions: props.otherConditions,
              onUpdate: updateCondition,
              onClose: (): void => setEditing(false),
            })
          ) : (
            <IconButton onClick={(): void => setEditing(true)}>
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
