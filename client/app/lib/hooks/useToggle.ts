import { useState } from 'react';

type ToggleHook = (
  initial?: boolean,
) => [boolean, () => void, (target?: boolean) => void];

const useToggle: ToggleHook = (initial = false) => {
  const [toggle, setToggle] = useState(initial);

  const setValue = (target?: boolean): void =>
    setToggle((value) => target ?? !value);

  const switchToggle = (): void => setValue();

  return [toggle, switchToggle, setValue];
};

export default useToggle;
