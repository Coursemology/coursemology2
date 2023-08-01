import { EffectCallback, useEffect, useRef } from 'react';

const useEffectOnce = (effect: EffectCallback): void => {
  const ref = useRef<boolean>(false);

  useEffect(() => {
    if (ref.current) return undefined;

    ref.current = true;
    return effect();
  }, []);
};

export default useEffectOnce;
