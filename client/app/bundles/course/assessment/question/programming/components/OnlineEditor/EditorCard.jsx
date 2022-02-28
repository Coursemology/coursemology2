import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AceEditor from 'react-ace';

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
};

class EditorCard extends Component {
  static getInputName(field) {
    return `question_programming[${field}]`;
  }

  codeChangeHandler(field) {
    return (e) => this.props.updateCodeBlock(field, e);
  }

  render() {
    const { mode, field, value, header, subtitle, isLoading } = this.props;
    return (
      <ExpansionPanel defaultExpanded style={styles.panel}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          style={styles.panelSummary}
        >
          <div style={styles.panelSummaryText}>
            {header}
            <br />
            <div style={styles.panelSummarySubtitle}>{subtitle}</div>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ padding: 0 }}>
          <textarea
            name={EditorCard.getInputName(field)}
            value={value}
            style={{ display: 'none' }}
            readOnly="true"
          />
          <AceEditor
            mode={mode}
            theme="monokai"
            width="100%"
            minLines={10}
            maxLines={Math.max(20, value.split(/\r\n|\r|\n/).length)}
            name={EditorCard.getInputName(field)}
            value={value}
            onChange={this.codeChangeHandler(field)}
            editorProps={{ $blockScrolling: true }}
            setOptions={{ useSoftTabs: true, readOnly: isLoading }}
          />
        </ExpansionPanelDetails>
      </ExpansionPanel>
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
};

export default injectIntl(EditorCard);
