import { Download } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import SearchField from 'lib/components/core/fields/SearchField';
import useTranslation from 'lib/hooks/useTranslation';

import { ToolbarProps } from '../adapters';

import translations from './translations';

interface ToolbarContainerProps {
  children: React.ReactNode;
}

const ToolbarContainer = ({ children }: ToolbarContainerProps): JSX.Element => (
  <div className="flex min-h-[6.5rem] px-5 py-5">{children}</div>
);

const MuiTableToolbar = (props: ToolbarProps): JSX.Element | null => {
  const { t } = useTranslation();

  const renderAlternative = props.alternative?.when();
  const renderNative = renderAlternative
    ? props.alternative?.keepNative
    : props.renderNative;

  if (!renderAlternative && !renderNative) return null;

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
    </ToolbarContainer>
  );
};

export default MuiTableToolbar;
