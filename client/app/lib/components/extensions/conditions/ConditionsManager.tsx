import {
  ComponentProps,
  createElement,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Add } from '@mui/icons-material';
import {
  Button,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { produce } from 'immer';
import {
  ConditionAbility,
  ConditionData,
  ConditionsData,
} from 'types/course/conditions';

import Subsection from 'lib/components/core/layouts/Subsection';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import ConditionRow from './ConditionRow';
import {
  createCondition,
  deleteCondition,
  updateCondition,
} from './operations';
import specify from './specifiers';
import translations from './translations';

interface ConditionsManagerProps {
  title: string;
  conditionsData: ConditionsData;
  description?: string;
  disabled?: boolean;
}

const Outlined = (props: ComponentProps<typeof Paper>): JSX.Element => (
  <Paper variant="outlined" {...props} />
);

const ConditionsManager = (props: ConditionsManagerProps): JSX.Element => {
  const { t } = useTranslation();
  const [conditions, setConditions] = useState(props.conditionsData.conditions);
  const [conditionToCreate, setConditionToCreate] =
    useState<ConditionAbility>();
  const [open, setOpen] = useState(false);
  const addConditionButton = useRef<HTMLButtonElement>(null);

  const conditionsByType = useMemo(
    () =>
      conditions.reduce((map, condition) => {
        if (!map[condition.type]) map[condition.type] = new Set();
        map[condition.type].add(
          specify(condition.type).extractUniqueData(condition),
        );
        return map;
      }, {}),
    [conditions],
  );

  const updateConditionsAndToast =
    (message: string) =>
    (data: ConditionData[]): void => {
      setConditions(data);
      toast.success(message);
    };

  const createConditionHandlerFor =
    (ability: ConditionAbility) =>
    (data: Partial<ConditionData>, onError?: (errors) => void): void => {
      const typedConditionData = produce(data, (draft) => {
        draft.type = ability.type;
      });

      createCondition(ability.url, typedConditionData)
        .then(updateConditionsAndToast(t(translations.conditionCreated)))
        .then(() => setConditionToCreate(undefined))
        .catch((error) => {
          if (error?.errors) return onError?.(error);
          return toast.error(
            t(translations.errorOccurredWhenCreatingCondition),
          );
        });
    };

  const handleUpdateCondition = (
    data: Partial<ConditionData>,
    onSuccess?: () => void,
    onError?: (errors) => void,
  ): void => {
    updateCondition(data)
      .then(updateConditionsAndToast(t(formTranslations.changesSaved)))
      .then(onSuccess)
      .catch((error) => {
        if (error?.errors) return onError?.(error);
        return toast.error(t(translations.errorOccurredWhenUpdatingCondition));
      });
  };

  const handleDeleteCondition = (
    url: ConditionData['url'],
  ): Promise<void | ConditionsData[]> =>
    deleteCondition(url).then(
      updateConditionsAndToast(t(translations.conditionDeleted)),
    );

  const renderCondition = (condition: ConditionData): JSX.Element => (
    <ConditionRow
      key={condition.type + condition.id}
      condition={condition}
      onDelete={handleDeleteCondition}
      onUpdate={handleUpdateCondition}
      otherConditions={conditionsByType[condition.type]}
    />
  );

  return (
    <Subsection
      className="mt-4"
      subtitle={props.description}
      title={props.title}
    >
      <div className="flex h-16 items-center space-x-4">
        <Button
          ref={addConditionButton}
          disabled={props.disabled}
          onClick={(): void => setOpen(true)}
          size="small"
          startIcon={<Add />}
          variant="outlined"
        >
          {t(translations.addCondition)}
        </Button>

        {conditionToCreate &&
          createElement(specify(conditionToCreate.type).component, {
            open: Boolean(conditionToCreate),
            otherConditions: conditionsByType[conditionToCreate.type],
            onUpdate: createConditionHandlerFor(conditionToCreate),
            onClose: () => setConditionToCreate(undefined),
            conditionAbility: conditionToCreate,
          })}
      </div>

      {conditions.length > 0 && (
        <TableContainer className="mt-8" component={Outlined}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="body2">
                    {t(translations.type)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {t(translations.condition)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>{conditions?.map(renderCondition)}</TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={addConditionButton.current}
        onClose={(): void => setOpen(false)}
        open={!props.disabled && open}
      >
        {props.conditionsData.enabledConditions.map((ability) => (
          <MenuItem
            key={ability.type}
            onClick={(): void => {
              setConditionToCreate(ability);
              setOpen(false);
            }}
          >
            {ability.type}
          </MenuItem>
        ))}
      </Menu>
    </Subsection>
  );
};

export default ConditionsManager;
