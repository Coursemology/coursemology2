import produce from 'immer';
import {
  ComponentProps,
  createElement,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { Add } from '@mui/icons-material';
import { toast } from 'react-toastify';

import {
  ConditionAbility,
  ConditionData,
  ConditionsData,
} from 'types/course/conditions';
import useTranslation from 'lib/hooks/useTranslation';
import useToggle from 'lib/hooks/useToggle';
import Subsection from 'lib/components/layouts/Subsection';
import formTranslations from 'lib/translations/form';
import translations from './translations';
import Condition from './conditions';
import specify from './specifiers';
import {
  createCondition,
  deleteCondition,
  updateCondition,
} from './operations';

interface ConditionsManagerProps {
  title: string;
  description?: string;
  conditionsData: ConditionsData;
}

const Outlined = (props: ComponentProps<typeof Paper>): JSX.Element => (
  <Paper variant="outlined" {...props} />
);

const ConditionsManager = (props: ConditionsManagerProps): JSX.Element => {
  const { t } = useTranslation();
  const [conditions, setConditions] = useState(props.conditionsData.conditions);
  const [conditionToCreate, setConditionToCreate] =
    useState<ConditionAbility>();
  const [adding, toggleAdding] = useToggle(false);
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

  const createConditionOfType =
    (ability: ConditionAbility) =>
    (data: Partial<ConditionData>, onError?: (errors) => void): void => {
      createCondition(
        ability.url,
        produce(data, (draft) => {
          draft.type = ability.type;
        }),
      )
        .then(updateConditionsAndToast(t(translations.conditionCreated)))
        .then(() => setConditionToCreate(undefined))
        .catch(onError);
    };

  const handleUpdateCondition = (
    data: Partial<ConditionData>,
  ): Promise<void | ConditionsData[]> =>
    updateCondition(data).then(
      updateConditionsAndToast(t(formTranslations.changesSaved)),
    );

  const handleDeleteCondition = (
    url: ConditionData['url'],
  ): Promise<void | ConditionsData[]> =>
    deleteCondition(url).then(
      updateConditionsAndToast(t(translations.conditionDeleted)),
    );

  const renderCondition = (condition: ConditionData): JSX.Element => (
    <Condition
      key={condition.type + condition.id}
      condition={condition}
      otherConditions={conditionsByType[condition.type]}
      onUpdate={handleUpdateCondition}
      onDelete={handleDeleteCondition}
    />
  );

  return (
    <Subsection
      title={props.title}
      subtitle={props.description}
      className="mt-4"
    >
      <div className="flex h-16 items-center space-x-4">
        <Button
          ref={addConditionButton}
          startIcon={<Add />}
          variant="outlined"
          size="small"
          onClick={toggleAdding}
        >
          {t(translations.addCondition)}
        </Button>

        {conditionToCreate &&
          createElement(specify(conditionToCreate.type).component, {
            open: Boolean(conditionToCreate),
            otherConditions: conditionsByType[conditionToCreate.type],
            onUpdate: createConditionOfType(conditionToCreate),
            onClose: () => setConditionToCreate(undefined),
          })}
      </div>

      {conditions.length > 0 && (
        <TableContainer component={Outlined} className="mt-8">
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
        open={adding}
        anchorEl={addConditionButton.current}
        onClose={toggleAdding}
      >
        {props.conditionsData.enabledConditions.map((ability) => (
          <MenuItem
            key={ability.type}
            onClick={(): void => {
              setConditionToCreate(ability);
              toggleAdding();
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
