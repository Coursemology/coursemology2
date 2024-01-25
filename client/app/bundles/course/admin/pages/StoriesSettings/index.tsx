import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Alert } from '@mui/material';
import { StoriesSettingsData } from 'types/course/admin/stories';

import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { fetchStoriesSettings, updateStoriesSettings } from './operations';

const translations = defineMessages({
  storiesSettings: {
    id: 'course.admin.storiesSettings.storiesSettings',
    defaultMessage: 'Stories settings',
  },
  pushKey: {
    id: 'course.admin.storiesSettings.pushKey',
    defaultMessage: 'Push key',
  },
  pushKeyPointsToCourse: {
    id: 'course.admin.storiesSettings.pushKeyPointsToCourse',
    defaultMessage: 'This push key points to <link>{course}</link> on Genie.',
  },
  pushKeyError: {
    id: 'course.admin.storiesSettings.pushKeyError',
    defaultMessage:
      "This push key doesn't point to a valid course on Genie. Please check your settings on Genie and try again.",
  },
  pingError: {
    id: 'course.admin.storiesSettings.pingError',
    defaultMessage:
      'There was a problem connecting to Genie. You may try again at a later time.',
  },
});

const PingResultAlert = (
  props: StoriesSettingsData['pingResult'],
): JSX.Element => {
  const { status, remoteCourseName, remoteCourseUrl } = props;

  const { t } = useTranslation();

  if (status === 'error')
    return <Alert severity="error">{t(translations.pingError)}</Alert>;

  if (remoteCourseName && remoteCourseUrl)
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

  return <Alert severity="error">{t(translations.pushKeyError)}</Alert>;
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
      {(data): JSX.Element => (
        <Form
          disabled={submitting}
          emitsVia={setForm}
          headsUp
          initialValues={data}
          onSubmit={handleSubmit}
        >
          {(control, watch, { isDirty }): JSX.Element => {
            return (
              <Section sticksToNavbar title={t(translations.storiesSettings)}>
                <Subsection
                  subtitle="Coursemology can push resources from this course to Genie that you can later embed in the stories created in Genie. Coursemology will also automatically keep them up to date."
                  title="Embeddable resources"
                >
                  <Controller
                    control={control}
                    name="pushKey"
                    render={({ field, fieldState }): JSX.Element => (
                      <FormTextField
                        disabled={submitting}
                        field={field}
                        fieldState={fieldState}
                        fullWidth
                        label={t(translations.pushKey)}
                        variant="filled"
                      />
                    )}
                  />

                  {!isDirty && <PingResultAlert {...watch('pingResult')} />}
                </Subsection>
              </Section>
            );
          }}
        </Form>
      )}
    </Preload>
  );
};

export default StoriesSettings;
