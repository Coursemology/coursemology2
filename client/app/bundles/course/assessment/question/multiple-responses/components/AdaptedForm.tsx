import { ComponentType } from 'react';

import useTranslation, { Translated } from 'lib/hooks/useTranslation';

import {
  mcqAdapter,
  McqMrqAdapter,
  mrqAdapter,
} from '../commons/translationAdapter';

import McqMrqForm, { AdaptedFormProps } from './McqMrqForm';

const AdaptedForm = <T extends 'new' | 'edit'>(
  texts: Translated<McqMrqAdapter>,
): ComponentType<AdaptedFormProps<T>> => {
  const Component = (props: AdaptedFormProps<T>): JSX.Element => {
    const { t } = useTranslation();

    return <McqMrqForm adapter={texts(t)} {...props} />;
  };

  Component.displayName = 'AdaptedForm';

  return Component;
};

export default {
  Mcq: AdaptedForm(mcqAdapter),
  Mrq: AdaptedForm(mrqAdapter),
};
