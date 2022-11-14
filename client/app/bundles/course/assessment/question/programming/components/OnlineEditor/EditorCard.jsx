import { Component } from 'react';
import AceEditor from 'react-ace';
import { injectIntl } from 'react-intl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import PropTypes from 'prop-types';

const styles = {
  panel: {
    margin: 0,
  },
  panelSummary: {
    fontSize: 14,
    fontWeight: 'bold',
    margin: 0,
  },
  panelSummaryText: {
    flexDirection: 'column',
  },
  panelSummarySubtitle: {
    color: 'grey',
  },
  panelSummarySubtitleError: {
    color: 'red',
  },
};

class EditorCard extends Component {
  static getInputName(field) {
    return `question_programming[${field}]`;
  }

  codeChangeHandler(field) {
    return (e) => this.props.updateCodeBlock(field, e);
  }

  render() {
    const { mode, field, value, header, subtitle, isLoading, error } =
      this.props;
    return (
      <Accordion defaultExpanded style={styles.panel}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={styles.panelSummary}
        >
          <div style={styles.panelSummaryText}>
            {header}
            <br />
            <div
              style={
                error
                  ? styles.panelSummarySubtitleError
                  : styles.panelSummarySubtitle
              }
            >
              {subtitle}
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails style={{ padding: 0 }}>
          <textarea
            name={EditorCard.getInputName(field)}
            readOnly
            style={{ display: 'none' }}
            value={value}
          />
          <AceEditor
            editorProps={{ $blockScrolling: true }}
            maxLines={Math.max(20, value.split(/\r\n|\r|\n/).length)}
            minLines={10}
            mode={mode}
            name={EditorCard.getInputName(field)}
            onChange={this.codeChangeHandler(field)}
            setOptions={{ useSoftTabs: true, readOnly: isLoading }}
            theme="monokai"
            value={value}
            width="100%"
          />
        </AccordionDetails>
      </Accordion>
    );
  }
}

EditorCard.propTypes = {
  updateCodeBlock: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  field: PropTypes.string,
  value: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default injectIntl(EditorCard);
