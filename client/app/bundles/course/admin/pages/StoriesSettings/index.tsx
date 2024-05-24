import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Alert } from '@mui/material';
import { StoriesSettingsData } from 'types/course/admin/stories';

import Section from 'lib/components/core/layouts/Section';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import Introduction from './components/Introduction';
import { fetchStoriesSettings, updateStoriesSettings } from './operations';

const translations = defineMessages({
  storiesSettings: {
    id: 'course.admin.storiesSettings.storiesSettings',
    defaultMessage: 'Stories settings',
  },
  integrationSettings: {
    id: 'course.admin.storiesSettings.integrationSettings',
    defaultMessage: 'Integration settings',
  },
  pushKey: {
    id: 'course.admin.storiesSettings.pushKey',
    defaultMessage: 'Integration key',
  },
  pushKeyPointsToCourse: {
    id: 'course.admin.storiesSettings.pushKeyPointsToCourse',
    defaultMessage:
      'This integration key points to <link>{course}</link> on Cikgo.',
  },
  pushKeyError: {
    id: 'course.admin.storiesSettings.pushKeyError',
    defaultMessage:
      "This integration key doesn't point to a valid course on Cikgo. Please check your settings on Cikgo and try again.",
  },
  pushKeyHint: {
    id: 'course.admin.storiesSettings.pushKeyHint',
    defaultMessage:
      "Integration keys aren't strictly secretive, but should be handled in confidence.",
  },
  pingError: {
    id: 'course.admin.storiesSettings.pingError',
    defaultMessage:
      'There was a problem connecting to Cikgo. You may try again at a later time.',
  },
  learnTitle: {
    id: 'course.admin.storiesSettings.learnTitle',
    defaultMessage: 'Learn page title',
  },
  leaveEmptyToUseDefaultTitle: {
    id: 'course.admin.storiesSettings.leaveEmptyToUseDefaultTitle',
    defaultMessage: 'Leave empty to use the default "Learn" title.',
  },
});

const PingResultAlert = (
  props: StoriesSettingsData['pingResult'],
): JSX.Element | null => {
  const { status, remoteCourseName, remoteCourseUrl } = props;

  const { t } = useTranslation();

  if (!status) return null;

  if (status === 'error')
    return <Alert severity="error">{t(translations.pingError)}</Alert>;

  if (!(remoteCourseName && remoteCourseUrl))
    return <Alert severity="error">{t(translations.pushKeyError)}</Alert>;

  return (
    <Alert severity="success">
      {t(translations.pushKeyPointsToCourse, {
        course: remoteCourseName,
        link: (chunk) => (
          <Link external href={remoteCourseUrl} opensInNewTab>
            {chunk}
          </Link>
        ),
      })}
    </Alert>
  );
};

const StoriesSettings = (): JSX.Element => {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormEmitter<StoriesSettingsData>>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (data: StoriesSettingsData): void => {
    setSubmitting(true);

    updateStoriesSettings(data)
      .then((newData) => {
        if (!newData) return;

        form?.resetTo?.(newData);
        toast.success(t(formTranslations.changesSaved));
      })
      .catch(form?.receiveErrors)
      .finally(() => setSubmitting(false));
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchStoriesSettings}>
      {(data) => (
        <Form
          disabled={submitting}
          emitsVia={setForm}
          headsUp
          initialValues={data}
          onSubmit={handleSubmit}
        >
          {(control, watch, { isDirty }) => (
            <>
              <Section sticksToNavbar title={t(translations.storiesSettings)}>
                <Controller
                  control={control}
                  name="title"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      disabled={submitting}
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      helperText={t(translations.leaveEmptyToUseDefaultTitle)}
                      label={t(translations.learnTitle)}
                      variant="filled"
                    />
                  )}
                />
              </Section>

              <Section
                sticksToNavbar
                title={t(translations.integrationSettings)}
              >
                <Introduction className="mb-2" />

                <Controller
                  control={control}
                  name="pushKey"
                  render={({ field, fieldState }): JSX.Element => (
                    <FormTextField
                      disabled={submitting}
                      disableMargins
                      field={field}
                      fieldState={fieldState}
                      fullWidth
                      helperText={t(translations.pushKeyHint)}
                      label={t(translations.pushKey)}
                      variant="filled"
                    />
                  )}
                />

                {!isDirty && <PingResultAlert {...watch('pingResult')} />}
              </Section>
            </>
          )}
        </Form>
      )}
    </Preload>
  );
};

export default StoriesSettings;
