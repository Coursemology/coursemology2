import { ReactNode, useCallback, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  FaceOutlined,
  SmartToyOutlined,
  SupervisorAccountOutlined,
  SvgIconComponent,
} from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { ScholaisticSettingsData } from 'types/course/admin/scholaistic';

import Section from 'lib/components/core/layouts/Section';
import Link from 'lib/components/core/Link';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { useLoader } from './loader';
import { updateScholaisticSettings } from './operations';

const IntroductionItem = ({
  Icon,
  children,
}: {
  Icon: SvgIconComponent;
  children?: ReactNode;
}): JSX.Element => {
  return (
    <div className="flex gap-5 text-neutral-500">
      <div>
        <Icon className="text-[3rem] shrink-0 p-2 rounded-xl bg-neutral-100" />
      </div>

      <div className="flex flex-col justify-center">
        <Typography variant="body2">{children}</Typography>
      </div>
    </div>
  );
};

const ScholaisticSettings = (): JSX.Element => {
  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef<FormRef<ScholaisticSettingsData>>(null);

  const initialValues = useLoader();

  const handleSubmit = useCallback((data: ScholaisticSettingsData): void => {
    setSubmitting(true);

    updateScholaisticSettings(data)
      .then((newData) => {
        if (!newData) return;

        formRef.current?.resetTo?.(newData);
        toast.success(t(formTranslations.changesSaved));
      })
      .catch(formRef.current?.receiveErrors)
      .finally(() => setSubmitting(false));
  }, []);

  return (
    <Form
      ref={formRef}
      disabled={submitting}
      headsUp
      initialValues={initialValues}
    >
      {(control, watch, { isDirty }) => (
        <>
          <Section
            sticksToNavbar
            title={t({
              defaultMessage: 'Role-Playing Chatbots & Assessments Settings',
            })}
          >
            <Controller
              control={control}
              name="assessmentsTitle"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={submitting}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  helperText={t({
                    defaultMessage: 'Leave empty to use default title',
                  })}
                  label={t({ defaultMessage: 'Assessments Title' })}
                  variant="filled"
                />
              )}
            />
          </Section>

          <Section
            contentClassName="flex flex-col gap-5"
            sticksToNavbar
            title={t({ defaultMessage: 'Integration settings' })}
          >
            <div className="flex flex-col gap-5">
              <Typography variant="body2">
                {t(
                  {
                    defaultMessage:
                      "This feature is powered by <link>ScholAIstic</link>. To begin using this feature, you'll need to link a course in ScholAIstic with this course. Here's what's going to happen once both courses are linked.",
                  },
                  {
                    link: (chunk) => (
                      <Link external opensInNewTab to="https://scholaistic.com">
                        {chunk}
                      </Link>
                    ),
                  },
                )}
              </Typography>

              <div className="flex flex-col gap-4">
                <IntroductionItem Icon={SmartToyOutlined}>
                  {t({
                    defaultMessage:
                      "You'll be able to create role-playing chatbots and assessments in this course. The published ones will be available to your students.",
                  })}
                </IntroductionItem>

                <IntroductionItem Icon={SupervisorAccountOutlined}>
                  {t({
                    defaultMessage:
                      'Only you, Owners, and Managers can configure the link of this course with ScholAIstic. The courses can be unlinked at any time.',
                  })}
                </IntroductionItem>

                <IntroductionItem Icon={FaceOutlined}>
                  {t(
                    {
                      defaultMessage:
                        "User accounts on ScholAIstic will automatically be created if they don't yet exist. Information shared with ScholAIstic is governed by <ourPpLink>our Privacy Policy</ourPpLink> and <scholaisticTosLink>ScholAIstic's Terms of Service</scholaisticTosLink>.",
                    },
                    {
                      ourPpLink: (chunk) => (
                        <Link opensInNewTab to="/pages/privacy_policy">
                          {chunk}
                        </Link>
                      ),
                      scholaisticTosLink: (chunk) => (
                        <Link
                          external
                          opensInNewTab
                          to="https://scholaistic.com/terms"
                        >
                          {chunk}
                        </Link>
                      ),
                    },
                  )}
                </IntroductionItem>
              </div>
            </div>

            <Button className="w-fit" variant="contained">
              {t({ defaultMessage: 'Link a ScholAIstic course' })}
            </Button>
          </Section>
        </>
      )}
    </Form>
  );
};

export default ScholaisticSettings;
