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

/**
 * The prop that should be extended by conformers of `AnyCondition` component.
 */
export type AnyConditionProps<AnyConditionData extends ConditionData> =
  AnyConditionBaseProps &
    (AnyConditionItem<AnyConditionData> | AnyConditionDraft);

/**
 * A generic type that represents a presentable form of any unlock conditions.
 *
 * Used by a `Specifier` to define the specific `component` of an unlock condition.
 */
export type AnyCondition = <AnyConditionData extends ConditionData>(
  props: AnyConditionProps<AnyConditionData>,
) => JSX.Element;
