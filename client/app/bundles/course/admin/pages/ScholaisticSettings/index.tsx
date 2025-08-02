import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  FaceOutlined,
  SmartToyOutlined,
  SupervisorAccountOutlined,
  SvgIconComponent,
} from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { ScholaisticSettingsData } from 'types/course/admin/scholaistic';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import Section from 'lib/components/core/layouts/Section';
import Link from 'lib/components/core/Link';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { useLoader } from './loader';
import {
  getLinkScholaisticCourseUrl,
  unlinkScholaisticCourse,
  updateScholaisticSettings,
} from './operations';
import PingResultAlert from './PingResultAlert';

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
  const [confirmUnlinkPromptOpen, setConfirmUnlinkPromptOpen] = useState(false);
  const [linkingOrigin, setLinkingOrigin] = useState<string>();

  useEffect(() => {
    if (!linkingOrigin) return () => {};

    const handleLinked = (event: MessageEvent<{ type: 'linked' }>): void => {
      if (event.origin !== linkingOrigin || event.data?.type !== 'linked')
        return;

      window.focus();
      window.location.reload();
    };

    window.addEventListener('message', handleLinked);

    return () => {
      window.removeEventListener('message', handleLinked);
    };
  }, [linkingOrigin]);

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

  const handleLinkCourse = useCallback((): void => {
    setSubmitting(true);

    getLinkScholaisticCourseUrl()
      .then((url) => {
        setLinkingOrigin(new URL(url).origin);
        window.open(url, '_blank');
      })
      .catch((error) => {
        console.error(error);

        toast.error(
          t({
            defaultMessage:
              'Something went wrong when requesting a course link from ScholAIstic.',
          }),
        );
      })
      .finally(() => setSubmitting(false));
  }, []);

  const handleUnlinkCourses = useCallback((): void => {
    setSubmitting(true);

    unlinkScholaisticCourse()
      .then(() => {
        toast.success(t({ defaultMessage: 'The courses have been unlinked.' }));
        window.location.reload();
      })
      .catch((error) => {
        setSubmitting(false);
        console.error(error);

        toast.error(
          t({
            defaultMessage: 'Something went wrong when unlinking the courses.',
          }),
        );
      });
  }, []);

  return (
    <div className="pb-32">
      <Form
        ref={formRef}
        className="!pb-0"
        disabled={submitting}
        headsUp
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {(control) => (
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
                    defaultMessage:
                      'Leave empty to use default "Role-Playing Assessments" title.',
                  })}
                  label={t({ defaultMessage: 'Assessments Title' })}
                  variant="filled"
                />
              )}
            />
          </Section>
        )}
      </Form>

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

        {!initialValues.pingResult && (
          <Button
            className="w-fit"
            onClick={handleLinkCourse}
            variant="contained"
          >
            {t({ defaultMessage: 'Link a ScholAIstic course' })}
          </Button>
        )}

        {initialValues.pingResult && (
          <>
            <PingResultAlert result={initialValues.pingResult} />

            <Button
              className="w-fit"
              color="error"
              onClick={() => setConfirmUnlinkPromptOpen(true)}
              variant="outlined"
            >
              {t({ defaultMessage: 'Unlink these courses' })}
            </Button>

            <Prompt
              contentClassName="gap-4 flex flex-col"
              disabled={submitting}
              onClickPrimary={handleUnlinkCourses}
              onClose={() => setConfirmUnlinkPromptOpen(false)}
              open={confirmUnlinkPromptOpen}
              primaryColor="error"
              primaryLabel={t({ defaultMessage: 'Unlink these courses' })}
              title={t({
                defaultMessage: "Sure you're unlinking these courses?",
              })}
            >
              <PromptText>
                {t({
                  defaultMessage:
                    'Once you unlink these courses, users in this course will no longer be able to access the role-playing chatbots and assessments in the linked ScholAIstic course.',
                })}
              </PromptText>

              <PromptText>
                {t({
                  defaultMessage:
                    'No user data will be deleted. You can link these courses again at any time.',
                })}
              </PromptText>
            </Prompt>
          </>
        )}
      </Section>
    </div>
  );
};

export default ScholaisticSettings;
