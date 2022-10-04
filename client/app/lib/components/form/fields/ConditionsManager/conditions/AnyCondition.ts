import { ConditionData } from 'types/course/conditions';

export interface AnyConditionProps<AnyConditionData extends ConditionData> {
  condition?: AnyConditionData;
  open: boolean;
  otherConditions: Set<number>;
  onUpdate: (data: ConditionData, onError?: (errors) => void) => void;
  onClose: () => void;
}

export type AnyCondition = <AnyConditionData extends ConditionData>(
  props: AnyConditionProps<AnyConditionData>,
) => JSX.Element;
