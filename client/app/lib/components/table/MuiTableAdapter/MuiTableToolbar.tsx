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
  defaultDirectExport: {
    id: 'lib.components.table.MuiTableToolbar.directExport',
    defaultMessage: 'Export',
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
    props.columnPicker?.triggerLabel ??
    t(localTranslations.defaultPickerTrigger);

  const directExportLabel =
    props.columnPicker?.directExportLabel ??
    t(localTranslations.defaultDirectExport);

  return (
    <ToolbarContainer>
      <div className="flex w-full items-center gap-4">
        {renderNative && (
          <SearchField
            className="min-w-0 flex-1"
            onChangeKeyword={props.onSearchKeywordChange}
            placeholder={props.searchPlaceholder ?? t(translations.search)}
            value={props.searchKeyword}
          />
        )}

        {renderAlternative && props.alternative?.render()}
        {renderNative && !renderAlternative && props.buttons}

        {renderNative && props.columnPicker && (
          <Button
            className="shrink-0"
            color="primary"
            onClick={() => setPickerOpen(true)}
            variant="outlined"
          >
            {triggerLabel}
          </Button>
        )}

        {renderNative && props.columnPicker && props.onDirectExport && (
          <Tooltip title={props.columnPicker.directExportTooltip ?? ''}>
            <span className="shrink-0">
              <Button
                color="primary"
                endIcon={<Download />}
                onClick={props.onDirectExport}
                variant="contained"
              >
                {directExportLabel}
              </Button>
            </span>
          </Tooltip>
        )}

        {renderNative && props.onDownloadCsv && (
          <Tooltip
            title={props.csvDownloadLabel ?? t(translations.downloadAsCsv)}
          >
            <IconButton className="shrink-0" onClick={props.onDownloadCsv}>
              <Download />
            </IconButton>
          </Tooltip>
        )}
      </div>

      {props.columnPicker && props.commitColumnVisibility && (
        <MuiColumnPickerDialog
          columnPicker={props.columnPicker}
          commitColumnVisibility={props.commitColumnVisibility}
          initialVisibility={props.getColumnVisibility?.() ?? {}}
          locked={props.columnPicker.locked}
          onClose={() => setPickerOpen(false)}
          onExportFromPicker={props.onExportFromPicker}
          open={pickerOpen}
        />
      )}
    </ToolbarContainer>
  );
};

export default MuiTableToolbar;
