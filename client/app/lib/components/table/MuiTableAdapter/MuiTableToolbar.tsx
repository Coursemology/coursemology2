import { Download } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import SearchField from 'lib/components/core/fields/SearchField';

import { ToolbarProps } from '../adapters';

interface ToolbarContainerProps {
  children: React.ReactNode;
}

const ToolbarContainer = ({ children }: ToolbarContainerProps): JSX.Element => (
  <div className="flex min-h-[6.5rem] px-5 py-5">{children}</div>
);

const MuiTableToolbar = (props: ToolbarProps): JSX.Element | null => {
  if (props.alternative?.when())
    return <ToolbarContainer>{props.alternative.render()}</ToolbarContainer>;

  if (props.renderNative)
    return (
      <ToolbarContainer>
        <div className="flex w-full justify-between">
          {props.onSearchKeywordChange && (
            <SearchField
              className="w-1/2"
              onChangeKeyword={props.onSearchKeywordChange}
              placeholder={props.searchPlaceholder ?? 'Search'}
            />
          )}

          <div className="flex items-center">
            {props.buttons}

            {props.onDownloadCsv && (
              <Tooltip title={props.csvDownloadLabel ?? 'Download as CSV'}>
                <IconButton onClick={props.onDownloadCsv}>
                  <Download />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
      </ToolbarContainer>
    );

  return null;
};

export default MuiTableToolbar;
