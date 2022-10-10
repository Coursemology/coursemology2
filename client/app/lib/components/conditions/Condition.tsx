import { createElement } from 'react';
import { Create, Delete } from '@mui/icons-material';
import { TableRow, TableCell, IconButton, Typography } from '@mui/material';
import { toast } from 'react-toastify';

import { ConditionData, ConditionsData } from 'types/course/conditions';
import useToggle from 'lib/hooks/useToggle';
import specify from './specifiers';

interface ConditionProps<AnyConditionData extends ConditionData> {
  condition: AnyConditionData;
  otherConditions: Set<number>;
  onUpdate: (data: Partial<ConditionData>) => Promise<void | ConditionsData[]>;
  onDelete: (url: ConditionData['url']) => Promise<void | ConditionsData[]>;
}

const Condition = <AnyConditionData extends ConditionData>(
  props: ConditionProps<AnyConditionData>,
): JSX.Element => {
  const [editing, toggleEditing] = useToggle(false);
  const { component } = specify(props.condition.type);

  const updateCondition = (
    data: ConditionData,
    onError?: (errors) => void,
  ): void => {
    props.onUpdate(data).then(toggleEditing).catch(onError);
  };

  const deleteCondition = (): void => {
    props.onDelete(props.condition.url).catch(toast.error);
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

        <div className="flex items-center hoverable:opacity-0 hoverable:group-hover:opacity-100">
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

export default Condition;
