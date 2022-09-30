import { Typography } from '@mui/material';
import FormTextField from 'lib/components/form/fields/TextField';
import Section from 'lib/components/layouts/Section';
import useTranslation from 'lib/hooks/useTranslation';
import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { VideosSettingsData, VideosTab } from 'types/course/admin/videos';
import Form, { FormEmitter } from 'lib/components/form/Form';
import translations from './translations';
import commonTranslations from '../../translations';
import VideosTabsManager from './VideosTabsManager';

interface VideosSettingsFormProps extends Emits<FormEmitter> {
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
      initialValues={props.data}
      headsUp
      emitsVia={props.emitsVia}
      onSubmit={props.onSubmit}
    >
      {(control): JSX.Element => (
        <>
          <Section title={t(translations.videosSettings)} sticksToNavbar>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  field={field}
                  fieldState={fieldState}
                  variant="filled"
                  label={t(commonTranslations.title)}
                  fullWidth
                  disabled={props.disabled}
                />
              )}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              className="!mt-2"
            >
              {t(commonTranslations.leaveEmptyToUseDefaultTitle)}
            </Typography>
          </Section>

          <Section
            title={t(translations.videosTabs)}
            subtitle={t(translations.videosTabsSubtitle)}
            sticksToNavbar
          >
            <Controller
              name="tabs"
              control={control}
              render={({ field }): JSX.Element => (
                <VideosTabsManager
                  tabs={field.value}
                  onUpdate={field.onChange}
                  onCreateTab={props.onCreateTab}
                  onDeleteTab={props.onDeleteTab}
                  canCreateTabs={props.canCreateTabs}
                  disabled={props.disabled}
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
