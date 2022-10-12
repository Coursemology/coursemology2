import { ConditionAbility, ConditionData } from 'types/course/conditions';

interface AnyConditionBaseProps {
  open: boolean;
  otherConditions: Set<number>;
  onUpdate: (data: ConditionData, onError?: (errors) => void) => void;
  onClose: () => void;
}

interface AnyConditionDraft {
  conditionAbility?: ConditionAbility;
  condition?: never;
}

interface AnyConditionItem<AnyConditionData> {
  conditionAbility?: never;
  condition?: AnyConditionData;
}

export type AnyConditionProps<AnyConditionData extends ConditionData> =
  AnyConditionBaseProps &
    (AnyConditionItem<AnyConditionData> | AnyConditionDraft);

export type AnyCondition = <AnyConditionData extends ConditionData>(
  props: AnyConditionProps<AnyConditionData>,
) => JSX.Element;
