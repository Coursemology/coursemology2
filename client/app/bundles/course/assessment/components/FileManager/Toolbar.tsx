import { ChangeEventHandler } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Button, Grid } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

import t from './translations.intl';

/**
 * Types are all any for now because DataTable is not fully typed.
 */
interface ToolbarProps extends WrappedComponentProps {
  selectedRows;
  onAddFiles: (files: File[]) => void;
  onDeleteFileWithRowIndex: (index: number) => void;
}

const Toolbar = (props: ToolbarProps): JSX.Element => {
  const { intl } = props;

  const handleDeleteFiles = (e): void => {
    e.preventDefault();

    props.selectedRows?.data?.forEach((row) => {
      props.onDeleteFileWithRowIndex?.(row.dataIndex);
    });
  };

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    const input = e.target;
    const files = input.files;
    if (!files) return;

    props.onAddFiles?.(Array.from(files));

    input.value = '';
  };

  return (
    <Grid container spacing={1}>
      <Grid item>
        <Button startIcon={<AddIcon />} variant="outlined" size="small">
          {intl.formatMessage(t.addFiles)}
          <input
            type="file"
            multiple
            className="absolute top-0 bottom-0 right-0 left-0 cursor-pointer opacity-0"
            onChange={handleFileInputChange}
            data-testid="FileInput"
          />
        </Button>
      </Grid>

      {props.selectedRows && (
        <Grid item>
          <Button
            startIcon={<DeleteIcon />}
            size="small"
            color="error"
            onClick={handleDeleteFiles}
          >
            {intl.formatMessage(t.deleteSelected)}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default injectIntl(Toolbar);
