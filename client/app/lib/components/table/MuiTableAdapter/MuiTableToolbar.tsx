import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Download } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';

import SearchField from 'lib/components/core/fields/SearchField';
import useTranslation from 'lib/hooks/useTranslation';

import { ToolbarProps } from '../adapters';

import MuiColumnPickerDialog from './MuiColumnPickerDialog';
import translations from './translations';

interface ToolbarContainerProps {
  children: React.ReactNode;
}

const localTranslations = defineMessages({
  defaultPickerTrigger: {
    id: 'lib.components.table.MuiTableToolbar.exportTrigger',
    defaultMessage: 'Export…',
  },
});

const ToolbarContainer = ({ children }: ToolbarContainerProps): JSX.Element => (
  <div className="flex min-h-[6.5rem] px-5 py-5">{children}</div>
);

const MuiTableToolbar = (props: ToolbarProps): JSX.Element | null => {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);

  const renderAlternative = props.alternative?.when();
  const renderNative = renderAlternative
    ? props.alternative?.keepNative
    : props.renderNative;

  if (!renderAlternative && !renderNative) return null;

  const triggerLabel =
    props.columnPicker?.triggerLabel ?? t(localTranslations.defaultPickerTrigger);

  return (
    <ToolbarContainer>
      <div className="flex w-full gap-6">
        {renderNative && (
          <SearchField
            className="mr-4 lg:mr-0 lg:w-1/2"
            onChangeKeyword={props.onSearchKeywordChange}
            placeholder={props.searchPlaceholder ?? t(translations.search)}
            value={props.searchKeyword}
          />
        )}

        <div className="flex flex-grow items-center justify-end gap-6">
          {renderAlternative && props.alternative?.render()}
          {renderNative && !renderAlternative && props.buttons}

          {renderNative && props.columnPicker && (
            <Button
              variant="outlined"
              color="primary"
              endIcon={<Download />}
              onClick={() => setPickerOpen(true)}
            >
              {triggerLabel}
            </Button>
          )}

          {renderNative && props.onDownloadCsv && (
            <Tooltip
              title={props.csvDownloadLabel ?? t(translations.downloadAsCsv)}
            >
              <IconButton onClick={props.onDownloadCsv}>
                <Download />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      {props.columnPicker && (
        <MuiColumnPickerDialog
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          initialVisibility={props.getColumnVisibility?.() ?? {}}
          locked={props.columnPicker.locked}
          columnPicker={props.columnPicker}
          commitColumnVisibility={props.commitColumnVisibility!}
          onExportFromPicker={props.onExportFromPicker}
        />
      )}
    </ToolbarContainer>
  );
};

export default MuiTableToolbar;
