import { useCallback, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { defineMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { ScholaisticAssessmentUpdateData } from 'types/course/scholaistic';
import { getIdFromUnknown } from 'utilities';

import assessmentFormTranslations from 'course/assessment/components/AssessmentForm/translations';
import { withScholaisticAsyncContainer } from 'course/scholaistic/components/ScholaisticAsyncContainer';
import ScholaisticFramePage from 'course/scholaistic/components/ScholaisticFramePage';
import Page from 'lib/components/core/layouts/Page';
import Section from 'lib/components/core/layouts/Section';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { useLoader } from './loader';
import { updateScholaisticAssessment } from './operations';

const ScholaisticAssessmentEdit = (): JSX.Element => {
  const { t } = useTranslation();

  const data = useLoader();

  const assessmentId = getIdFromUnknown(useParams().assessmentId)!;

  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef<FormRef<typeof data.assessment>>(null);

  const handleSubmit = useCallback(
    (newData: ScholaisticAssessmentUpdateData): void => {
      setSubmitting(true);

      updateScholaisticAssessment(assessmentId, newData)
        .then(() => {
          formRef.current?.resetTo?.(newData);
          toast.success(t(formTranslations.changesSaved));
        })
        .catch(formRef.current?.receiveErrors)
        .finally(() => setSubmitting(false));
    },
    [],
  );

  return (
    <Page className="gap-5" title={t({ defaultMessage: 'Edit Assessment' })}>
      <Section
        sticksToNavbar
        title={t(assessmentFormTranslations.assessmentDetails)}
      >
        <ScholaisticFramePage framed src={data.embedSrc} />
      </Section>

      {data.display.isGamified && (
        <Section
          sticksToNavbar
          title={t(assessmentFormTranslations.gamification)}
        >
          <Form
            ref={formRef}
            disabled={submitting}
            headsUp
            initialValues={data.assessment}
            onSubmit={handleSubmit}
          >
            {(control) => (
              <Controller
                control={control}
                name="baseExp"
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    disabled={submitting}
                    disableMargins
                    field={field}
                    fieldState={fieldState}
                    fullWidth
                    label={t(assessmentFormTranslations.baseExp)}
                    onWheel={(event): void => event.currentTarget.blur()}
                    type="number"
                    variant="filled"
                  />
                )}
              />
            )}
          </Form>
        </Section>
      )}
    </Page>
  );
};

export const handle = defineMessage({ defaultMessage: 'Edit' });

export default withScholaisticAsyncContainer(ScholaisticAssessmentEdit);
