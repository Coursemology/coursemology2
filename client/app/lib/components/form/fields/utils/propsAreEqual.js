/**
 * Determines whether the MUI component in the react-hook-form's controller should re-render.
 * We are using this function to prevent unnecessary component re-rendering,
 * when the root component/form is using watch/useWatch.
 * Initially, we are only comparing value, error and disabled props across different
 * rendering phases. There is a problem when we do a conditional rendering of a component.
 * Say a component A is only rendered when component B's value is enabled.
 * When component B is disabled again, component A should be removed, but since the function below
 * does not detect the change, component B does not disappear.
 * As such, we add another props renderIf and passed to the MUI components
 * to determine if it should be rendered or not.
 *
 * @param prevProps Previous props of the form component
 * @param nextProps Next props of the form component
 * @return true if the form component should not re-render false otherwise
 */
const propsAreEqual = (prevProps, nextProps) => {
  const { value: prevValue } = prevProps.field;
  const { error: prevError } = prevProps.fieldState;
  const { value: nextValue } = nextProps.field;
  const { error: nextError } = nextProps.fieldState;
  const { disabled: prevDisabled } = prevProps;
  const { disabled: nextDisabled } = nextProps;
  const { renderIf: prevRenderIf } = prevProps;
  const { renderIf: nextRenderIf } = nextProps;
  // Only for SelectField
  const { options: prevOptions } = prevProps;
  const { options: nextOptions } = nextProps;
  const valueIsUnchanged = prevValue === nextValue;
  const errorIsUnchanged = prevError === nextError;
  const isDisabledUnchanged = prevDisabled === nextDisabled;
  const isRenderIfUnchanged = prevRenderIf === nextRenderIf;
  const isOptionsUnchanged = prevOptions === nextOptions;
  return (
    valueIsUnchanged &&
    errorIsUnchanged &&
    isDisabledUnchanged &&
    isRenderIfUnchanged &&
    isOptionsUnchanged
  );
};

export default propsAreEqual;
