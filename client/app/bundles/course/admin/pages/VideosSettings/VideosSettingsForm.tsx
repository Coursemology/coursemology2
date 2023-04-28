import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { Typography } from '@mui/material';
import { VideosSettingsData, VideosTab } from 'types/course/admin/videos';

import Section from 'lib/components/core/layouts/Section';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import commonTranslations from '../../translations';

import translations from './translations';
import VideosTabsManager from './VideosTabsManager';

interface VideosSettingsFormProps
  extends Emits<FormEmitter<VideosSettingsData>> {
  data: VideosSettingsData;
  onSubmit: (data: VideosSettingsData) => void;
  onCreateTab: (title: VideosTab['title'], weight: VideosTab['weight']) => void;
  onDeleteTab: (id: VideosTab['id'], title: VideosTab['title']) => void;
  canCreateTabs?: boolean;
  disabled?: boolean;
}

const VideosSettingsForm = (props: VideosSettingsFormProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Form
      disabled={props.disabled}
      emitsVia={props.emitsVia}
      headsUp
      initialValues={props.data}
      onSubmit={props.onSubmit}
    >
      {(control): JSX.Element => (
        <>
          <Section sticksToNavbar title={t(translations.videosSettings)}>
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  label={t(commonTranslations.title)}
                  variant="filled"
                />
              )}
            />

            <Typography
              className="!mt-2"
              color="text.secondary"
              variant="body2"
            >
              {t(commonTranslations.leaveEmptyToUseDefaultTitle)}
            </Typography>
          </Section>

          <Section
            sticksToNavbar
            subtitle={t(translations.videosTabsSubtitle)}
            title={t(translations.videosTabs)}
          >
            <Controller
              control={control}
              name="tabs"
              render={({ field }): JSX.Element => (
                <VideosTabsManager
                  canCreateTabs={props.canCreateTabs}
                  disabled={props.disabled}
                  onCreateTab={props.onCreateTab}
                  onDeleteTab={props.onDeleteTab}
                  onUpdate={field.onChange}
                  tabs={field.value}
                />
              )}
            />
          </Section>
        </>
      )}
    </Form>
  );
};

export default VideosSettingsForm;
