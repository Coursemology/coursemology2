import { injectIntl } from 'react-intl';
import { Button, TableCell, TableRow } from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import styles from './OnlineEditorView.scss';

function formatBytes(bytes, decimals) {
  if (bytes === 0) return '0 Byte';
  const k = 1000; // or 1024 for binary
  const dm = decimals || 3;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

const ExistingPackageFile = (props) => {
  const {
    filename,
    fileType,
    filesize,
    toDelete,
    deleteExistingPackageFile,
    isLoading,
    isLast,
  } = props;
  const buttonClass = toDelete ? 'fa fa-undo' : 'fa fa-trash';
  const buttonColor = toDelete ? 'white' : grey[300];
  const rowStyle = toDelete
    ? { textDecoration: 'line-through', backgroundColor: grey[100] }
    : {};
  if (isLast) {
    rowStyle.borderBottom = 'none';
  }

  return (
    <TableRow style={rowStyle}>
      <TableCell className={styles.deleteButtonCell}>
        <Button
          disabled={isLoading}
          onClick={() => {
            deleteExistingPackageFile(props.fileType, filename, !toDelete);
          }}
          style={{
            backgroundColor: buttonColor,
            color: 'black',
            height: '40px',
            minWidth: '40px',
            width: '40px',
          }}
          variant="contained"
        >
          <i className={buttonClass} />
        </Button>
        <input
          checked={toDelete}
          hidden
          name={`question_programming[${`${fileType}_to_delete`}][${filename}]`}
          readOnly
          type="checkbox"
        />
      </TableCell>
      <TableCell>{filename}</TableCell>
      <TableCell>{formatBytes(filesize, 2)}</TableCell>
    </TableRow>
  );
};

ExistingPackageFile.propTypes = {
  filename: PropTypes.string.isRequired,
  fileType: PropTypes.string.isRequired,
  filesize: PropTypes.number.isRequired,
  toDelete: PropTypes.bool.isRequired,
  deleteExistingPackageFile: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
};

export default injectIntl(ExistingPackageFile);
