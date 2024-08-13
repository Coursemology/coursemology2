import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import translations from 'course/assessment/submission/translations';
import ErrorText from 'lib/components/core/ErrorText';
import useTranslation from 'lib/hooks/useTranslation';

import { ErrorStruct } from '../validations/types';

const ErrorMessages: FC = () => {
  const { t } = useTranslation();
  const {
    formState: { errors },
  } = useFormContext();

  return (
    errors && (
      <div className="flex flex-col text-right">
        <ErrorText
          errors={
            Object.keys(errors).length > 0
              ? t(translations.submissionError, {
                  questions: Object.values(errors)
                    .map(
                      (error) =>
                        (error as unknown as ErrorStruct).questionNumber,
                    )
                    .join(', '),
                })
              : ''
          }
        />
      </div>
    )
  );
};

export default ErrorMessages;
